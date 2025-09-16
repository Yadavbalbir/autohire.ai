import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ProctoringContextType, ProctoringEvent, ProctoringEventType } from "./types";

export const ProctoringContext = createContext<ProctoringContextType | undefined>(undefined);

export const ProctoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eventLog, setEventLog] = useState<ProctoringEvent[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  // Helper to log events
  const logEvent = (type: ProctoringEventType, details?: Record<string, any>) => {
    setEventLog((prev) => [
      ...prev,
      { type, timestamp: Date.now(), details },
    ]);
  };

  // Tab/Window focus/blur tracking
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        logEvent("TAB_BLUR");
      } else if (document.visibilityState === "visible") {
        logEvent("TAB_FOCUS");
      }
    };
    const handleWindowBlur = () => logEvent("WINDOW_BLUR");
    const handleWindowFocus = () => logEvent("WINDOW_FOCUS");

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
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
