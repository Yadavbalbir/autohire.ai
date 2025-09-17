import React, { useEffect, useRef, useState } from 'react';import React, { useEffect, useRef, useState } from 'react';import React, { useEffect, useRef, useState } from 'react';import React, { useEffect, useRef, useState, useCallback } from 'react';import React, { useEffect, useRef, useState, useCallback } from 'react';import React, { useEffect, useRef, useState, useCallback } from 'react';

import { CameraOff, MicOff } from 'lucide-react';

import { CameraOff, MicOff } from 'lucide-react';

interface CandidateVideoFeedProps {

  isEnabled: boolean;import { CameraOff, MicOff } from 'lucide-react';

  isAudioEnabled: boolean;

}interface CandidateVideoFeedProps {



const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({   isEnabled: boolean;import { CameraOff, MicOff, AlertTriangle, RefreshCw } from 'lucide-react';

  isEnabled, 

  isAudioEnabled   isAudioEnabled: boolean;

}) => {

  const videoRef = useRef<HTMLVideoElement>(null);}interface CandidateVideoFeedProps {

  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({   isEnabled: boolean;import { CameraOff, MicOff, AlertTriangle, RefreshCw } from 'lucide-react';import { CameraOff, MicOff, AlertTriangle, RefreshCw } from 'lucide-react';

  useEffect(() => {

    const startCamera = async () => {  isEnabled, 

      try {

        setIsLoading(true);  isAudioEnabled   isAudioEnabled: boolean;

        setError('');

        }) => {

        if (isEnabled) {

          const stream = await navigator.mediaDevices.getUserMedia({  const videoRef = useRef<HTMLVideoElement>(null);}interface CandidateVideoFeedProps {

            video: {

              width: { ideal: 1280 },  const streamRef = useRef<MediaStream | null>(null);

              height: { ideal: 720 },

              facingMode: 'user'  const [error, setError] = useState<string>('');

            },

            audio: isAudioEnabled  const [isLoading, setIsLoading] = useState(true);

          });

          const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({   isEnabled: boolean;

          streamRef.current = stream;

            useEffect(() => {

          if (videoRef.current) {

            videoRef.current.srcObject = stream;    const startCamera = async () => {  isEnabled, 

          }

                try {

          if (videoRef.current) {

            videoRef.current.muted = true;        setIsLoading(true);  isAudioEnabled   isAudioEnabled: boolean;

          }

        } else {        setError('');

          if (streamRef.current) {

            streamRef.current.getTracks().forEach(track => track.stop());        }) => {

            streamRef.current = null;

          }        if (isEnabled) {

          

          if (videoRef.current) {          const stream = await navigator.mediaDevices.getUserMedia({  const videoRef = useRef<HTMLVideoElement>(null);  onDeviceError?: (error: string) => void;interface CandidateVideoFeedProps {interface CandidateVideoFeedProps {

            videoRef.current.srcObject = null;

          }            video: {

        }

      } catch (err) {              width: { ideal: 1280 },  const streamRef = useRef<MediaStream | null>(null);

        console.error('Error accessing camera:', err);

        setError('Camera access denied or not available');              height: { ideal: 720 },

      } finally {

        setIsLoading(false);              facingMode: 'user'  const [error, setError] = useState<string>('');  onDeviceSuccess?: () => void;

      }

    };            },



    startCamera();            audio: isAudioEnabled  const [isLoading, setIsLoading] = useState(true);



    return () => {          });

      if (streamRef.current) {

        streamRef.current.getTracks().forEach(track => track.stop());          }  isEnabled: boolean;  isEnabled: boolean;

      }

    };          streamRef.current = stream;

  }, [isEnabled, isAudioEnabled]);

            useEffect(() => {

  return (

    <div className="relative w-full h-full bg-gray-800 overflow-hidden">          if (videoRef.current) {

      {isEnabled && !error && (

        <video            videoRef.current.srcObject = stream;    const startCamera = async () => {

          ref={videoRef}

          autoPlay          }

          playsInline

          muted                try {

          className="w-full h-full object-cover transform scale-x-[-1]"

        />          if (videoRef.current) {

      )}

                  videoRef.current.muted = true;        setIsLoading(true);const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({   isAudioEnabled: boolean;  isAudioEnabled: boolean;

      {isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">          }

          <div className="text-center">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>        } else {        setError('');

            <p className="text-white text-sm">Starting camera...</p>

          </div>          if (streamRef.current) {

        </div>

      )}            streamRef.current.getTracks().forEach(track => track.stop());          isEnabled, 

      

      {error && (            streamRef.current = null;

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center text-red-400">          }        if (isEnabled) {

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

            <p className="text-sm">{error}</p>          

          </div>

        </div>          if (videoRef.current) {          const stream = await navigator.mediaDevices.getUserMedia({  isAudioEnabled,  onDeviceError?: (error: string) => void;  onDeviceError?: (error: string) => void;

      )}

                  videoRef.current.srcObject = null;

      {!isEnabled && !isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">          }            video: {

          <div className="text-center text-gray-400">

            <CameraOff className="w-12 h-12 mx-auto mb-4" />        }

            <p className="text-sm">Camera is off</p>

          </div>      } catch (err) {              width: { ideal: 1280 },  onDeviceError,

        </div>

      )}        console.error('Error accessing camera:', err);



      <div className="absolute bottom-0 right-0 p-4">        setError('Camera access denied or not available');              height: { ideal: 720 },

        <div className="flex items-center space-x-2 text-white">

          {!isEnabled && <CameraOff className="w-4 h-4" />}      } finally {

          {!isAudioEnabled && <MicOff className="w-4 h-4" />}

        </div>        setIsLoading(false);              facingMode: 'user'  onDeviceSuccess  onDeviceSuccess?: () => void;  onDeviceSuccess?: () => void;

      </div>

            }

      <div className="absolute top-4 left-4">

        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">    };            },

          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

          <span className="text-white text-xs font-medium">LIVE</span>

        </div>

      </div>    startCamera();            audio: isAudioEnabled}) => {

    </div>

  );

};

    return () => {          });

export default CandidateVideoFeed;
      if (streamRef.current) {

        streamRef.current.getTracks().forEach(track => track.stop());            const videoRef = useRef<HTMLVideoElement>(null);}}

      }

    };          streamRef.current = stream;

  }, [isEnabled, isAudioEnabled]);

            const streamRef = useRef<MediaStream | null>(null);

  return (

    <div className="relative w-full h-full bg-gray-800 overflow-hidden">          if (videoRef.current) {

      {isEnabled && !error && (

        <video            videoRef.current.srcObject = stream;  const [error, setError] = useState<string>('');

          ref={videoRef}

          autoPlay          }

          playsInline

          muted            const [isLoading, setIsLoading] = useState(true);

          className="w-full h-full object-cover transform scale-x-[-1]"

        />          // Mute the video element to prevent feedback

      )}

                if (videoRef.current) {  const [permissionDenied, setPermissionDenied] = useState(false);const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({ const CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({ 

      {isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">            videoRef.current.muted = true;

          <div className="text-center">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>          }  const [deviceNotFound, setDeviceNotFound] = useState(false);

            <p className="text-white text-sm">Starting camera...</p>

          </div>        } else {

        </div>

      )}          // Stop the current stream if disabling camera  isEnabled,   isEnabled, 

      

      {error && (          if (streamRef.current) {

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center text-red-400">            streamRef.current.getTracks().forEach(track => track.stop());  // Check device permissions

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

            <p className="text-sm">{error}</p>            streamRef.current = null;

          </div>

        </div>          }  const checkPermissions = useCallback(async () => {  isAudioEnabled,  isAudioEnabled,

      )}

                

      {!isEnabled && !isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">          if (videoRef.current) {    try {

          <div className="text-center text-gray-400">

            <CameraOff className="w-12 h-12 mx-auto mb-4" />            videoRef.current.srcObject = null;

            <p className="text-sm">Camera is off</p>

          </div>          }      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });  onDeviceError,  onDeviceError,

        </div>

      )}        }



      <div className="absolute bottom-0 right-0 p-4">      } catch (err) {      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        <div className="flex items-center space-x-2 text-white">

          {!isEnabled && <CameraOff className="w-4 h-4" />}        console.error('Error accessing camera:', err);

          {!isAudioEnabled && <MicOff className="w-4 h-4" />}

        </div>        setError('Camera access denied or not available');        onDeviceSuccess  onDeviceSuccess

      </div>

            } finally {

      <div className="absolute top-4 left-4">

        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">        setIsLoading(false);      const cameraAllowed = cameraPermission.state === 'granted';

          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

          <span className="text-white text-xs font-medium">LIVE</span>      }

        </div>

      </div>    };      const microphoneAllowed = microphonePermission.state === 'granted';}) => {}) => {

    </div>

  );

};

    startCamera();      

export default CandidateVideoFeed;


    // Cleanup function      if (!cameraAllowed && isEnabled) {  const videoRef = useRef<HTMLVideoElement>(null);  const videoRef = useRef<HTMLVideoElement>(null);

    return () => {

      if (streamRef.current) {        setPermissionDenied(true);

        streamRef.current.getTracks().forEach(track => track.stop());

      }        setError('Camera permission is required for the interview');  const streamRef = useRef<MediaStream | null>(null);  const streamRef = useRef<MediaStream | null>(null);

    };

  }, [isEnabled, isAudioEnabled]);        onDeviceError?.('Camera permission denied');



  return (        return false;  const [error, setError] = useState<string>('');  const [error, setError] = useState<string>('');

    <div className="relative w-full h-full bg-gray-800 overflow-hidden">

      {/* Video Element */}      }

      {isEnabled && !error && (

        <video        const [isLoading, setIsLoading] = useState(true);  const [isLoading, setIsLoading] = useState(true);

          ref={videoRef}

          autoPlay      if (!microphoneAllowed && isAudioEnabled) {

          playsInline

          muted        setPermissionDenied(true);  const [permissionDenied, setPermissionDenied] = useState(false);  const [permissionDenied, setPermissionDenied] = useState(false);

          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect

        />        setError('Microphone permission is required for the interview');

      )}

              onDeviceError?.('Microphone permission denied');  const [deviceNotFound, setDeviceNotFound] = useState(false);  const [deviceNotFound, setDeviceNotFound] = useState(false);

      {/* Loading State */}

      {isLoading && (        return false;

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center">      }

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>

            <p className="text-white text-sm">Starting camera...</p>      

          </div>

        </div>      return true;  // Check device permissionsconst CandidateVideoFeed: React.FC<CandidateVideoFeedProps> = ({ 

      )}

          } catch (err) {

      {/* Error State */}

      {error && (      // Permissions API might not be supported, proceed with getUserMedia  const checkPermissions = useCallback(async () => {  isEnabled, 

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center text-red-400">      console.warn('Permissions API not supported:', err);

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

            <p className="text-sm">{error}</p>      return true;    try {  isAudioEnabled 

          </div>

        </div>    }

      )}

        }, [isEnabled, isAudioEnabled, onDeviceError]);      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });}) => {

      {/* Camera Disabled State */}

      {!isEnabled && !isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center text-gray-400">  // Enhanced camera startup with better error handling      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });  const videoRef = useRef<HTMLVideoElement>(null);

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

            <p className="text-sm">Camera is off</p>  const startCamera = useCallback(async () => {

          </div>

        </div>    try {        const streamRef = useRef<MediaStream | null>(null);

      )}

      setIsLoading(true);

      {/* Status Indicators */}

      <div className="absolute bottom-0 right-0 p-4">      setError('');      const cameraAllowed = cameraPermission.state === 'granted';  const [error, setError] = useState<string>('');

        <div className="flex items-center space-x-2 text-white">

          {!isEnabled && <CameraOff className="w-4 h-4" />}      setPermissionDenied(false);

          {!isAudioEnabled && <MicOff className="w-4 h-4" />}

        </div>      setDeviceNotFound(false);      const microphoneAllowed = microphonePermission.state === 'granted';  const [isLoading, setIsLoading] = useState(true);

      </div>

            

      {/* Recording Indicator */}

      <div className="absolute top-4 left-4">      if (!isEnabled) {      

        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">

          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>        // Stop the current stream if disabling camera

          <span className="text-white text-xs font-medium">LIVE</span>

        </div>        if (streamRef.current) {      if (!cameraAllowed && isEnabled) {  useEffect(() => {

      </div>

    </div>          streamRef.current.getTracks().forEach(track => track.stop());

  );

};          streamRef.current = null;        setPermissionDenied(true);    const startCamera = async () => {



export default CandidateVideoFeed;        }

                setError('Camera permission is required for the interview');      try {

        if (videoRef.current) {

          videoRef.current.srcObject = null;        onDeviceError?.('Camera permission denied');        setIsLoading(true);

        }

        setIsLoading(false);        return false;        setError('');

        return;

      }      }        



      // Check permissions first              if (isEnabled) {

      const permissionsOk = await checkPermissions();

      if (!permissionsOk) {      if (!microphoneAllowed && isAudioEnabled) {          const stream = await navigator.mediaDevices.getUserMedia({

        setIsLoading(false);

        return;        setPermissionDenied(true);            video: {

      }

        setError('Microphone permission is required for the interview');              width: { ideal: 1280 },

      const stream = await navigator.mediaDevices.getUserMedia({

        video: {        onDeviceError?.('Microphone permission denied');              height: { ideal: 720 },

          width: { ideal: 1280 },

          height: { ideal: 720 },        return false;              facingMode: 'user'

          facingMode: 'user'

        },      }            },

        audio: isAudioEnabled

      });                  audio: isAudioEnabled

      

      streamRef.current = stream;      return true;          });

      

      if (videoRef.current) {    } catch (err) {          

        videoRef.current.srcObject = stream;

        videoRef.current.muted = true;      // Permissions API might not be supported, proceed with getUserMedia          streamRef.current = stream;

      }

            console.warn('Permissions API not supported:', err);          

      onDeviceSuccess?.();

            return true;          if (videoRef.current) {

    } catch (err: any) {

      console.error('Error accessing camera:', err);    }            videoRef.current.srcObject = stream;

      

      let errorMessage = 'Camera access denied or not available';  }, [isEnabled, isAudioEnabled, onDeviceError]);          }

      

      if (err.name === 'NotAllowedError') {          

        setPermissionDenied(true);

        errorMessage = 'Camera and microphone permissions are required for the interview';  // Enhanced camera startup with better error handling          // Mute the video element to prevent feedback

      } else if (err.name === 'NotFoundError') {

        setDeviceNotFound(true);  const startCamera = useCallback(async () => {          if (videoRef.current) {

        errorMessage = 'No camera or microphone found. Please connect your devices.';

      } else if (err.name === 'NotReadableError') {    try {            videoRef.current.muted = true;

        errorMessage = 'Camera is being used by another application. Please close other apps and try again.';

      } else if (err.name === 'OverconstrainedError') {      setIsLoading(true);          }

        errorMessage = 'Camera settings are not supported. Trying with default settings...';

      }      setError('');        } else {

      

      setError(errorMessage);      setPermissionDenied(false);          // Stop the current stream if disabling camera

      onDeviceError?.(errorMessage);

    } finally {      setDeviceNotFound(false);          if (streamRef.current) {

      setIsLoading(false);

    }                  streamRef.current.getTracks().forEach(track => track.stop());

  }, [isEnabled, isAudioEnabled, onDeviceError, onDeviceSuccess, checkPermissions]);

      if (!isEnabled) {            streamRef.current = null;

  // Retry function for failed camera access

  const retryCamera = useCallback(() => {        // Stop the current stream if disabling camera          }

    startCamera();

  }, [startCamera]);        if (streamRef.current) {          



  useEffect(() => {          streamRef.current.getTracks().forEach(track => track.stop());          if (videoRef.current) {

    startCamera();

          streamRef.current = null;            videoRef.current.srcObject = null;

    // Cleanup function

    return () => {        }          }

      if (streamRef.current) {

        streamRef.current.getTracks().forEach(track => track.stop());                }

      }

    };        if (videoRef.current) {      } catch (err) {

  }, [startCamera]);

          videoRef.current.srcObject = null;        console.error('Error accessing camera:', err);

  // Update audio track when audio enabled state changes

  useEffect(() => {        }        setError('Camera access denied or not available');

    if (streamRef.current) {

      const audioTracks = streamRef.current.getAudioTracks();        setIsLoading(false);      } finally {

      audioTracks.forEach(track => {

        track.enabled = isAudioEnabled;        return;        setIsLoading(false);

      });

    }      }      }

  }, [isAudioEnabled]);

    };

  return (

    <div className="relative w-full h-full bg-gray-800 overflow-hidden">      // Check permissions first

      {/* Video Element */}

      {isEnabled && !error && (      const permissionsOk = await checkPermissions();    startCamera();

        <video

          ref={videoRef}      if (!permissionsOk) {

          autoPlay

          playsInline        setIsLoading(false);    // Cleanup function

          muted

          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect        return;    return () => {

        />

      )}      }      if (streamRef.current) {

      

      {/* Loading State */}        streamRef.current.getTracks().forEach(track => track.stop());

      {isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">      const stream = await navigator.mediaDevices.getUserMedia({      }

          <div className="text-center">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>        video: {    };

            <p className="text-white text-sm">Starting camera...</p>

          </div>          width: { ideal: 1280 },  }, [isEnabled]); // Removed isAudioEnabled from dependencies

        </div>

      )}          height: { ideal: 720 },

      

      {/* Error State */}          facingMode: 'user'  // Update audio track when audio enabled state changes

      {error && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">        },  useEffect(() => {

          <div className="text-center text-red-400 max-w-sm mx-auto p-4">

            {permissionDenied ? (        audio: isAudioEnabled    if (streamRef.current) {

              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />

            ) : deviceNotFound ? (      });      const audioTracks = streamRef.current.getAudioTracks();

              <CameraOff className="w-12 h-12 mx-auto mb-4" />

            ) : (            audioTracks.forEach(track => {

              <CameraOff className="w-12 h-12 mx-auto mb-4" />

            )}      streamRef.current = stream;        track.enabled = isAudioEnabled;

            <p className="text-sm mb-4">{error}</p>

                        });

            {/* Retry button for certain error types */}

            {!permissionDenied && (      if (videoRef.current) {    }

              <button

                onClick={retryCamera}        videoRef.current.srcObject = stream;  }, [isAudioEnabled]);

                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"

              >        videoRef.current.muted = true;

                <RefreshCw className="w-4 h-4" />

                <span>Retry</span>      }  return (

              </button>

            )}          <div className="relative w-full h-full bg-gray-800 overflow-hidden">

            

            {/* Permission instructions */}      onDeviceSuccess?.();      {/* Video Element */}

            {permissionDenied && (

              <div className="mt-4 text-xs text-gray-300">            {isEnabled && !error && (

                <p className="mb-2">To enable camera and microphone:</p>

                <ul className="text-left space-y-1">    } catch (err: any) {        <video

                  <li>• Click the camera icon in your browser's address bar</li>

                  <li>• Select "Always allow" for this site</li>      console.error('Error accessing camera:', err);          ref={videoRef}

                  <li>• Refresh the page and try again</li>

                </ul>                autoPlay

              </div>

            )}      let errorMessage = 'Camera access denied or not available';          playsInline

          </div>

        </div>                muted

      )}

            if (err.name === 'NotAllowedError') {          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect

      {/* Camera Disabled State */}

      {!isEnabled && !isLoading && (        setPermissionDenied(true);        />

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

          <div className="text-center text-gray-400">        errorMessage = 'Camera and microphone permissions are required for the interview';      )}

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

            <p className="text-sm">Camera is off</p>      } else if (err.name === 'NotFoundError') {      

          </div>

        </div>        setDeviceNotFound(true);      {/* Loading State */}

      )}

        errorMessage = 'No camera or microphone found. Please connect your devices.';      {isLoading && (

      {/* Status Indicators */}

      <div className="absolute bottom-0 right-0 p-4">      } else if (err.name === 'NotReadableError') {        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

        <div className="flex items-center space-x-2 text-white">

          {!isEnabled && <CameraOff className="w-4 h-4" />}        errorMessage = 'Camera is being used by another application. Please close other apps and try again.';          <div className="text-center">

          {!isAudioEnabled && <MicOff className="w-4 h-4" />}

        </div>      } else if (err.name === 'OverconstrainedError') {            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>

      </div>

              errorMessage = 'Camera settings are not supported. Trying with default settings...';            <p className="text-white text-sm">Starting camera...</p>

      {/* Recording Indicator */}

      <div className="absolute top-4 left-4">      }          </div>

        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">

          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>              </div>

          <span className="text-white text-xs font-medium">LIVE</span>

        </div>      setError(errorMessage);      )}

      </div>

    </div>      onDeviceError?.(errorMessage);      

  );

};    } finally {      {/* Error State */}



export default CandidateVideoFeed;      setIsLoading(false);      {error && (

    }        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

  }, [isEnabled, isAudioEnabled, onDeviceError, onDeviceSuccess, checkPermissions]);          <div className="text-center text-red-400">

            <CameraOff className="w-12 h-12 mx-auto mb-4" />

  // Retry function for failed camera access            <p className="text-sm">{error}</p>

  const retryCamera = useCallback(() => {          </div>

    startCamera();        </div>

  }, [startCamera]);      )}

      

  useEffect(() => {      {/* Camera Disabled State */}

    startCamera();      {!isEnabled && !isLoading && (

        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">

    // Cleanup function          <div className="text-center text-gray-400">

    return () => {            <CameraOff className="w-12 h-12 mx-auto mb-4" />

      if (streamRef.current) {            <p className="text-sm">Camera is off</p>

        streamRef.current.getTracks().forEach(track => track.stop());          </div>

      }        </div>

    };      )}

  }, [startCamera]);

      {/* Status Indicators */}

  // Update audio track when audio enabled state changes      <div className="absolute bottom-0 right-0 p-4">

  useEffect(() => {        <div className="flex items-center space-x-2 text-white">

    if (streamRef.current) {          {!isEnabled && <CameraOff className="w-4 h-4" />}

      const audioTracks = streamRef.current.getAudioTracks();          {!isAudioEnabled && <MicOff className="w-4 h-4" />}

      audioTracks.forEach(track => {        </div>

        track.enabled = isAudioEnabled;      </div>

      });      

    }      {/* Recording Indicator */}

  }, [isAudioEnabled]);      <div className="absolute top-4 left-4">

        <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">

  return (          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

    <div className="relative w-full h-full bg-gray-800 overflow-hidden">          <span className="text-white text-xs font-medium">LIVE</span>

      {/* Video Element */}        </div>

      {isEnabled && !error && (      </div>

        <video    </div>

          ref={videoRef}  );

          autoPlay};

          playsInline

          mutedexport default CandidateVideoFeed;
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
          <div className="text-center text-red-400 max-w-sm mx-auto p-4">
            {permissionDenied ? (
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            ) : deviceNotFound ? (
              <CameraOff className="w-12 h-12 mx-auto mb-4" />
            ) : (
              <CameraOff className="w-12 h-12 mx-auto mb-4" />
            )}
            <p className="text-sm mb-4">{error}</p>
            
            {/* Retry button for certain error types */}
            {!permissionDenied && (
              <button
                onClick={retryCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
            
            {/* Permission instructions */}
            {permissionDenied && (
              <div className="mt-4 text-xs text-gray-300">
                <p className="mb-2">To enable camera and microphone:</p>
                <ul className="text-left space-y-1">
                  <li>• Click the camera icon in your browser's address bar</li>
                  <li>• Select "Always allow" for this site</li>
                  <li>• Refresh the page and try again</li>
                </ul>
              </div>
            )}
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