import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, MicOff } from 'lucide-react';

interface CandidateVideoFeedProps {
  isEnabled: boolean;
  isAudioEnabled: boolean;
}

const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({ 
  isEnabled, 
  isAudioEnabled 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (isEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: isAudioEnabled
          });
          
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Mute the video element to prevent feedback
          if (videoRef.current) {
            videoRef.current.muted = true;
          }
        } else {
          // Stop the current stream if disabling camera
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Camera access denied or not available');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isEnabled]); // Removed isAudioEnabled from dependencies

  // Update audio track when audio enabled state changes
  useEffect(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isAudioEnabled;
      });
    }
  }, [isAudioEnabled]);

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden">
      {/* Video Element */}
      {isEnabled && !error && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-sm">Starting camera...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-red-400">
            <CameraOff className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Camera Disabled State */}
      {!isEnabled && !isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <CameraOff className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">Camera is off</p>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-0 right-0 p-4">
        <div className="flex items-center space-x-2 text-white">
          {!isEnabled && <CameraOff className="w-4 h-4" />}
          {!isAudioEnabled && <MicOff className="w-4 h-4" />}
        </div>
      </div>
      
      {/* Recording Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateVideoFeed;