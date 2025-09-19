import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ProctoringContextType, ProctoringEvent, ProctoringEventType } from "./types";

export const ProctoringContext = createContext<ProctoringContextType | undefined>(undefined);

export const ProctoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eventLog, setEventLog] = useState<ProctoringEvent[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  // Always start with fresh events for each interview session
  useEffect(() => {
    const interviewId = getInterviewId();
    // Clear any existing events for this interview
    localStorage.removeItem(`proctoring_events_${interviewId}`);
    setEventLog([]);
  }, []);

  // Clear all proctoring events for current interview
  const clearProctoringEvents = () => {
    const interviewId = getInterviewId();
    setEventLog([]);
    localStorage.removeItem(`proctoring_events_${interviewId}`);
  };

  // Get current interview ID from URL or generate one
  const getInterviewId = () => {
    const path = window.location.pathname;
    const match = path.match(/\/interview\/([^\/]+)/);
    return match ? match[1] : 'current_interview';
  };

  // Helper to log events and persist to localStorage
  const logEvent = (type: ProctoringEventType, details?: Record<string, any>) => {
    const newEvent = { type, timestamp: Date.now(), details };
    console.log('🔍 Proctoring Event:', type, newEvent); // Enhanced debug logging
    
    setEventLog((prev) => {
      const updated = [...prev, newEvent];
      
      // Persist to localStorage for post-interview analysis
      const interviewId = getInterviewId();
      try {
        localStorage.setItem(`proctoring_events_${interviewId}`, JSON.stringify(updated));
        console.log(`💾 Saved ${updated.length} proctoring events for interview ${interviewId}`);
      } catch (error) {
        console.warn('Failed to save proctoring events to localStorage:', error);
      }
      
      return updated;
    });
  };

  // Tab/Window focus/blur tracking
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        console.log('📋 TAB_BLUR - User left interview tab');
        logEvent("TAB_BLUR");
      } else if (document.visibilityState === "visible") {
        console.log('📋 TAB_FOCUS - User returned to interview tab');
        logEvent("TAB_FOCUS");
      }
    };

    // const handleWindowBlur = () => {
    //   console.log('🪟 WINDOW_BLUR - User left interview window');
    //   logEvent("WINDOW_BLUR");
    // };
    
    // const handleWindowFocus = () => {
    //   console.log('🪟 WINDOW_FOCUS - User returned to interview window');
    //   logEvent("WINDOW_FOCUS");
    // };

    document.addEventListener("visibilitychange", handleVisibility);
    // window.addEventListener("blur", handleWindowBlur);
    // window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      // window.removeEventListener("blur", handleWindowBlur);
      // window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // Screen sharing controls (only works if interview is in-app)
  const startScreenShare = async () => {
    if (isScreenSharing) return;
    try {
      // Only works if user grants permission
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenShareStream.current = stream;
      setIsScreenSharing(true);
      logEvent("SCREEN_SHARE_START");
      // Listen for stop
      const [track] = stream.getVideoTracks();
      track.onended = () => stopScreenShare();
    } catch (err) {
      // User denied or not supported
    }
  };

  const stopScreenShare = () => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((t) => t.stop());
      screenShareStream.current = null;
    }
    if (isScreenSharing) {
      setIsScreenSharing(false);
      logEvent("SCREEN_SHARE_STOP");
    }
  };

  // Expose event log and controls
  const getEventLog = () => eventLog;

  return (
    <ProctoringContext.Provider
      value={{
        eventLog,
        startScreenShare,
        stopScreenShare,
        getEventLog,
        clearProctoringEvents,
        isScreenSharing,
      }}
    >
      {children}
    </ProctoringContext.Provider>
  );
};

export const useProctoringContext = () => {
  const ctx = useContext(ProctoringContext);
  if (!ctx) throw new Error("useProctoringContext must be used within ProctoringProvider");
  return ctx;
};
