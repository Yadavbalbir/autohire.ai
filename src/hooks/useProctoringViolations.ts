import { useMemo } from 'react';
import type { ProctoringEvent } from '../proctoring/types';

export interface ProctoringViolation {
  id: string;
  type: 'tab_switch' | 'window_switch' | 'screen_share_stop';
  timestamp: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  duration?: number; // Duration spent away (in milliseconds)
}

export interface ProctoringStats {
  tabSwitches: {
    count: number; // Number of times user left interview tab
    totalTimeAway: number; // Total milliseconds spent in other tabs
  };
  windowSwitches: {
    count: number; // Number of times user left interview window
    totalTimeAway: number; // Total milliseconds spent in other windows
  };
}

export const useProctoringViolations = (eventLog: ProctoringEvent[]) => {
  const result = useMemo(() => {
    const violationsList: ProctoringViolation[] = [];
    const stats: ProctoringStats = {
      tabSwitches: { count: 0, totalTimeAway: 0 },
      windowSwitches: { count: 0, totalTimeAway: 0 }
    };

    let pendingTabBlur: ProctoringEvent | null = null;
    let pendingWindowBlur: ProctoringEvent | null = null;

    eventLog.forEach((event) => {
      switch (event.type) {
        case 'TAB_BLUR':
          // User left interview tab - just store the event, don't count yet
          pendingTabBlur = event;
          break;

        case 'TAB_FOCUS':
          // User returned to interview tab - now we can count this as 1 complete tab switch
          if (pendingTabBlur) {
            stats.tabSwitches.count++; // Count here when we return, not when we leave
            const duration = event.timestamp - pendingTabBlur.timestamp;
            stats.tabSwitches.totalTimeAway += duration;
            pendingTabBlur = null;
          }
          break;

        case 'WINDOW_BLUR':
          // User left interview window - just store the event, don't count yet
          pendingWindowBlur = event;
          break;

        case 'WINDOW_FOCUS':
          // User returned to interview window - now we can count this as 1 complete window switch
          if (pendingWindowBlur) {
            stats.windowSwitches.count++; // Count here when we return, not when we leave
            const duration = event.timestamp - pendingWindowBlur.timestamp;
            stats.windowSwitches.totalTimeAway += duration;
            pendingWindowBlur = null;
          }
          break;

        case 'SCREEN_SHARE_STOP':
          // Screen share stopping is always a violation
          violationsList.push({
            id: `screen_share_stop_${event.timestamp}`,
            type: 'screen_share_stop',
            timestamp: event.timestamp,
            description: 'Screen sharing was stopped',
            severity: 'high'
          });
          break;

        default:
          break;
      }
    });

    // Handle any pending blurs (user hasn't returned yet)
    if (pendingTabBlur) {
      const currentTime = Date.now();
      const tabBlurEvent = pendingTabBlur as ProctoringEvent;
      const duration = currentTime - tabBlurEvent.timestamp;
      stats.tabSwitches.totalTimeAway += duration;
      
      violationsList.push({
        id: `tab_switch_pending_${tabBlurEvent.timestamp}`,
        type: 'tab_switch',
        timestamp: tabBlurEvent.timestamp,
        duration: duration,
        description: `Currently away from interview tab (${Math.round(duration / 1000)}s)`,
        severity: 'high'
      });
    }

    if (pendingWindowBlur) {
      const currentTime = Date.now();
      const windowBlurEvent = pendingWindowBlur as ProctoringEvent;
      const duration = currentTime - windowBlurEvent.timestamp;
      stats.windowSwitches.totalTimeAway += duration;
      
      violationsList.push({
        id: `window_switch_pending_${windowBlurEvent.timestamp}`,
        type: 'window_switch', 
        timestamp: windowBlurEvent.timestamp,
        duration: duration,
        description: `Interview window currently not in focus (${Math.round(duration / 1000)}s)`,
        severity: 'high'
      });
    }

    const violations = violationsList.sort((a, b) => b.timestamp - a.timestamp);

    const violationCounts = {
      total: violations.length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length,
      tabSwitches: violations.filter(v => v.type === 'tab_switch').length,
      windowSwitches: violations.filter(v => v.type === 'window_switch').length,
      screenShareStops: violations.filter(v => v.type === 'screen_share_stop').length
    };

    return { violations, violationCounts, stats };
  }, [eventLog]);

  return result;
};