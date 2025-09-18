export interface FaceDetectionEvent {
  timestamp: number;
  dateTime: string;
  event: 'no_face' | 'single_face' | 'multiple_faces' | 'model_loaded' | 'model_failed' | 'detection_started' | 'detection_stopped' | 'interview_ended';
  faceCount: number;
  confidence?: number[];
  boundingBoxes?: Array<{
    topLeft: [number, number];
    bottomRight: [number, number];
    landmarks?: Array<[number, number]>;
  }>;
  message: string;
  page: 'pre_interview' | 'interview' | 'other';
  additionalData?: any; // For storing statistics or extra data
}

class FaceDetectionLogger {
  private events: FaceDetectionEvent[] = [];
  private maxEvents: number = 1000; // Keep last 1000 events

  logEvent(event: Omit<FaceDetectionEvent, 'timestamp' | 'dateTime'>) {
    const timestamp = Date.now();
    const dateTime = new Date(timestamp).toISOString();
    
    const fullEvent: FaceDetectionEvent = {
      timestamp,
      dateTime,
      ...event
    };

    // Add to events array
    this.events.push(fullEvent);
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Console logging with colored output
    const colors: Record<string, string> = {
      no_face: '🔴',
      single_face: '🟢',
      multiple_faces: '🟡',
      model_loaded: '🟦',
      model_failed: '🟥',
      detection_started: '🟩',
      detection_stopped: '🟨',
      interview_ended: '📊'
    };

    const color = colors[event.event] || '⚪';
    
    console.log(`${color} [Face Detection] ${dateTime} - ${event.page.toUpperCase()}: ${event.message}`, {
      event: event.event,
      faceCount: event.faceCount,
      confidence: event.confidence,
      boundingBoxes: event.boundingBoxes
    });

    // Dispatch custom event for other parts of the app to listen
    window.dispatchEvent(new CustomEvent('faceDetectionEvent', { 
      detail: fullEvent 
    }));

    return fullEvent;
  }

  getEvents(): FaceDetectionEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: FaceDetectionEvent['event']): FaceDetectionEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getEventsInTimeRange(startTime: number, endTime: number): FaceDetectionEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  clearEvents() {
    this.events = [];
    this.logEvent({
      event: 'detection_started',
      faceCount: 0,
      message: 'Event log cleared',
      page: 'other'
    });
  }

  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  getStatistics() {
    const total = this.events.length;
    const byType = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeRange = this.events.length > 0 ? {
      start: new Date(this.events[0].timestamp).toISOString(),
      end: new Date(this.events[this.events.length - 1].timestamp).toISOString(),
      durationMs: this.events[this.events.length - 1].timestamp - this.events[0].timestamp
    } : null;

    return {
      totalEvents: total,
      eventsByType: byType,
      timeRange
    };
  }
}

// Create singleton instance
export const faceDetectionLogger = new FaceDetectionLogger();

// Global access
declare global {
  interface Window {
    faceDetectionLogger: FaceDetectionLogger;
  }
}

// Make it globally accessible
window.faceDetectionLogger = faceDetectionLogger;

export default faceDetectionLogger;