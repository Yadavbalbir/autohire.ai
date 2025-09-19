import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { faceDetectionLogger } from '../utils/faceDetectionLogger';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings,
  Play,
  Volume2,
  VolumeX,
  Monitor,
  User,
  UserX
} from 'lucide-react';

interface PreInterviewCheckProps {
  onStartInterview: () => void;
}

interface DeviceTest {
  camera: 'pending' | 'testing' | 'success' | 'failed';
  microphone: 'pending' | 'testing' | 'success' | 'failed';
  speakers: 'pending' | 'testing' | 'success' | 'failed';
  faceDetection: 'pending' | 'testing' | 'success' | 'failed';
}

const PreInterviewCheck: React.FC<PreInterviewCheckProps> = ({
  onStartInterview
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [deviceTests, setDeviceTests] = useState<DeviceTest>({
    camera: 'pending',
    microphone: 'pending',
    speakers: 'pending',
    faceDetection: 'pending'
  });

  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    speakers: [] as MediaDeviceInfo[]
  });
  
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });

  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFullScreenSupported, setIsFullScreenSupported] = useState(false);
  const [faceDetectionInitialized, setFaceDetectionInitialized] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [isFaceDetectionRunning, setIsFaceDetectionRunning] = useState(false);
  const faceDetectionIntervalRef = useRef<number | null>(null);
  const blazeFaceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);

  // Check if full screen is supported
  useEffect(() => {
    setIsFullScreenSupported(
      !!(document.documentElement.requestFullscreen ||
         (document.documentElement as any).webkitRequestFullscreen ||
         (document.documentElement as any).mozRequestFullScreen ||
         (document.documentElement as any).msRequestFullscreen)
    );
  }, []);

  // Initialize face detection models
  useEffect(() => {
    const initializeFaceAPI = async () => {
      try {
        console.log('Initializing TensorFlow.js and BlazeFace model...');
        faceDetectionLogger.logEvent({
          event: 'detection_started',
          faceCount: 0,
          message: 'Starting TensorFlow.js and BlazeFace model initialization',
          page: 'pre_interview'
        });
        
        // Initialize TensorFlow.js
        await tf.ready();
        console.log('TensorFlow.js ready');
        
        // Load BlazeFace model
        const model = await blazeface.load();
        blazeFaceModelRef.current = model;
        
        setFaceDetectionInitialized(true);
        console.log('BlazeFace model loaded successfully');
        
        faceDetectionLogger.logEvent({
          event: 'model_loaded',
          faceCount: 0,
          message: 'BlazeFace model loaded successfully',
          page: 'pre_interview'
        });
      } catch (error) {
        console.error('Failed to initialize face detection:', error);
        setFaceDetectionInitialized(false);
        
        faceDetectionLogger.logEvent({
          event: 'model_failed',
          faceCount: 0,
          message: `Failed to initialize face detection: ${error}`,
          page: 'pre_interview'
        });
      }
    };

    initializeFaceAPI();
  }, []);

  // Face detection function using BlazeFace with bounding box drawing
  const detectFaces = async () => {
    if (!videoRef.current || !faceDetectionInitialized || !blazeFaceModelRef.current) {
      return 0; // Return 0 faces if prerequisites not met
    }

    try {
      // Check if video is ready
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        return 0; // Return 0 faces if video not ready
      }

      // Run face detection
      const predictions = await blazeFaceModelRef.current.estimateFaces(videoRef.current, false);
      
      const faceCount = predictions.length;
      setFacesDetected(faceCount);
      
      // Clear previous drawings
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set canvas size to match video
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw bounding boxes for each detected face
          if (predictions.length > 0) {
            ctx.strokeStyle = faceCount === 1 ? '#10B981' : '#F59E0B'; // Green for single face, yellow for multiple
            ctx.lineWidth = 3;
            ctx.font = '16px Arial';
            ctx.fillStyle = faceCount === 1 ? '#10B981' : '#F59E0B';
            
            predictions.forEach((prediction, index) => {
              const [x, y] = prediction.topLeft as [number, number];
              const [x2, y2] = prediction.bottomRight as [number, number];
              const width = x2 - x;
              const height = y2 - y;
              
              // Draw rectangle
              ctx.strokeRect(x, y, width, height);
              
              // Draw face number and confidence if available
              const label = `Face ${index + 1}`;
              const labelWidth = ctx.measureText(label).width;
              
              // Background for text
              ctx.fillRect(x, y - 25, labelWidth + 10, 20);
              ctx.fillStyle = 'white';
              ctx.fillText(label, x + 5, y - 10);
              ctx.fillStyle = faceCount === 1 ? '#10B981' : '#F59E0B';
              
              // Draw landmarks if available
              if (prediction.landmarks) {
                ctx.fillStyle = '#EF4444'; // Red for landmarks
                (prediction.landmarks as number[][]).forEach(([lx, ly]) => {
                  ctx.beginPath();
                  ctx.arc(lx, ly, 2, 0, 2 * Math.PI);
                  ctx.fill();
                });
              }
            });
          }
        }
      }
      
      // Prepare bounding box data for logging
      const boundingBoxes = predictions.map(prediction => ({
        topLeft: prediction.topLeft as [number, number],
        bottomRight: prediction.bottomRight as [number, number],
        landmarks: prediction.landmarks as Array<[number, number]> | undefined
      }));
      
      // Log the detection event
      let event: 'no_face' | 'single_face' | 'multiple_faces';
      let message: string;
      
      if (faceCount === 0) {
        event = 'no_face';
        message = 'No faces detected in the video stream';
      } else if (faceCount === 1) {
        event = 'single_face';
        message = 'Single face detected successfully';
      } else {
        event = 'multiple_faces';
        message = `Multiple faces detected: ${faceCount} faces found`;
      }
      
      faceDetectionLogger.logEvent({
        event,
        faceCount,
        boundingBoxes: boundingBoxes.length > 0 ? boundingBoxes : undefined,
        message,
        page: 'pre_interview'
      });
      
      console.log(`Detected ${faceCount} face(s)`);
      console.log('Face detection function returning:', faceCount);
      return faceCount; // Return the actual face count, not boolean
    } catch (error) {
      console.error('Face detection error:', error);
      
      faceDetectionLogger.logEvent({
        event: 'no_face',
        faceCount: 0,
        message: `Face detection error: ${error}`,
        page: 'pre_interview'
      });
      
      return 0; // Return 0 faces on error
    }
  };

  // Start face detection monitoring
  const startFaceDetection = () => {
    if (isFaceDetectionRunning || !faceDetectionInitialized) return;
    
    console.log('Starting continuous face detection with comprehensive logging...');
    setIsFaceDetectionRunning(true);
    setDeviceTests(prev => ({ ...prev, faceDetection: 'testing' }));
    
    faceDetectionLogger.logEvent({
      event: 'no_face',
      faceCount: 0,
      message: 'Face detection system started - continuous monitoring active',
      page: 'pre_interview'
    });
    
    let consecutiveDetections = 0;
    const requiredConsecutiveDetections = 2; // Reduced to 2 for easier testing
    
    console.log(`🎯 Face detection test started: Need ${requiredConsecutiveDetections} consecutive single-face detections`);
    
    faceDetectionIntervalRef.current = window.setInterval(async () => {
      const detectedFaceCount = await detectFaces();
      
      // Check if exactly one face is detected
      if (detectedFaceCount === 1) {
        consecutiveDetections++;
        console.log(`✅ Single face detected - Progress: ${consecutiveDetections}/${requiredConsecutiveDetections}`);
        
        if (consecutiveDetections >= requiredConsecutiveDetections) {
          console.log('🎉 FACE DETECTION TEST PASSED! Proceeding to next step...');
          console.log(`Current step before: ${currentStep}, setting to step 3 (microphone test)`);
          
          faceDetectionLogger.logEvent({
            event: 'single_face',
            faceCount: 1,
            message: `Face detection test completed successfully after ${consecutiveDetections} consecutive detections`,
            page: 'pre_interview'
          });
          
          setDeviceTests(prev => {
            const updated = { ...prev, faceDetection: 'success' as const };
            console.log('Device tests updated:', updated);
            return updated;
          });
          
          stopFaceDetection();
          
          setTimeout(() => {
            console.log('Face detection complete - Moving to step 3 (microphone test)');
            setCurrentStep(3); // Go to microphone test
          }, 1000);
          return; // Exit the interval
        }
      } else {
        if (consecutiveDetections > 0) {
          console.log(`❌ Detection reset - Found ${detectedFaceCount} faces, need exactly 1. Starting over...`);
        }
        consecutiveDetections = 0; // Reset count if not exactly one face detected
      }
    }, 200); // Check every 200ms for smooth visual updates and responsive logging
    
    // Timeout after 15 seconds if no stable face detected
    setTimeout(() => {
      if (deviceTests.faceDetection === 'testing') {
        console.log('Face detection timeout - no stable face detected');
        faceDetectionLogger.logEvent({
          event: 'no_face',
          faceCount: 0,
          message: 'Face detection timeout after 15 seconds - no stable single face detected',
          page: 'pre_interview'
        });
        setDeviceTests(prev => ({ ...prev, faceDetection: 'failed' }));
        stopFaceDetection();
      }
    }, 15000);
  };

  // Stop face detection monitoring
  const stopFaceDetection = () => {
    console.log('Stopping face detection...');
    setIsFaceDetectionRunning(false);
    
    // Clear canvas overlay
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    
    faceDetectionLogger.logEvent({
      event: 'no_face',
      faceCount: 0,
      message: 'Face detection system stopped',
      page: 'pre_interview'
    });
  };

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices({
          cameras: devices.filter(device => device.kind === 'videoinput'),
          microphones: devices.filter(device => device.kind === 'audioinput'),
          speakers: devices.filter(device => device.kind === 'audiooutput')
        });

        // Set default devices
        const defaultCamera = devices.find(device => device.kind === 'videoinput');
        const defaultMic = devices.find(device => device.kind === 'audioinput');
        const defaultSpeaker = devices.find(device => device.kind === 'audiooutput');

        setSelectedDevices({
          camera: defaultCamera?.deviceId || '',
          microphone: defaultMic?.deviceId || '',
          speaker: defaultSpeaker?.deviceId || ''
        });
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();
  }, []);

  // Test camera
  const testCamera = async () => {
    setDeviceTests(prev => ({ ...prev, camera: 'testing' }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevices.camera ? { exact: selectedDevices.camera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => resolve();
          video.onerror = reject;
          video.play().catch(reject);
        });
        
        console.log(`Video loaded: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
      }

      setDeviceTests(prev => ({ ...prev, camera: 'success' }));
      
      // Wait a bit for video to stabilize, then start face detection
      setTimeout(() => {
        if (faceDetectionInitialized) {
          startFaceDetection();
        }
        setCurrentStep(2);
      }, 1500);
      
    } catch (error) {
      console.error('Camera test failed:', error);
      setDeviceTests(prev => ({ ...prev, camera: 'failed' }));
    }
  };

  // Test microphone
  const testMicrophone = async () => {
    setDeviceTests(prev => ({ ...prev, microphone: 'testing' }));
    setIsTestingAudio(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevices.microphone ? { exact: selectedDevices.microphone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Monitor audio levels
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);
        
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      };

      monitorAudioLevel();

      // Test for 3 seconds
      setTimeout(() => {
        setIsTestingAudio(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        stream.getTracks().forEach(track => track.stop());
        
        // Check if we detected any audio input
        if (audioLevel > 5) {
          setDeviceTests(prev => ({ ...prev, microphone: 'success' }));
          setTimeout(() => setCurrentStep(4), 1000);
        } else {
          setDeviceTests(prev => ({ ...prev, microphone: 'failed' }));
        }
      }, 3000);

    } catch (error) {
      console.error('Microphone test failed:', error);
      setDeviceTests(prev => ({ ...prev, microphone: 'failed' }));
      setIsTestingAudio(false);
    }
  };

  // Test speakers
  const testSpeakers = async () => {
    setDeviceTests(prev => ({ ...prev, speakers: 'testing' }));
    
    try {
      // Play a test tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        setDeviceTests(prev => ({ ...prev, speakers: 'success' }));
        setTimeout(() => setCurrentStep(5), 1000);
      }, 1000);
      
    } catch (error) {
      console.error('Speaker test failed:', error);
      setDeviceTests(prev => ({ ...prev, speakers: 'failed' }));
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    };
  }, []);

  // Retry failed test
  const retryTest = (testType: keyof DeviceTest) => {
    setDeviceTests(prev => ({ ...prev, [testType]: 'pending' }));
    if (testType === 'camera') {
      testCamera();
    } else if (testType === 'microphone') {
      testMicrophone();
    } else if (testType === 'speakers') {
      testSpeakers();
    } else if (testType === 'faceDetection') {
      startFaceDetection();
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const renderDeviceTest = (
    testType: keyof DeviceTest,
    icon: React.ReactNode,
    offIcon: React.ReactNode,
    title: string,
    description: string
  ) => {
    const status = deviceTests[testType];
    
    return (
      <div className={`p-6 rounded-lg border-2 transition-all ${
        status === 'success' ? 'border-green-500 bg-green-50' :
        status === 'failed' ? 'border-red-500 bg-red-50' :
        status === 'testing' ? 'border-blue-500 bg-blue-50' :
        'border-gray-300 bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              status === 'success' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' :
              status === 'testing' ? 'bg-blue-500' :
              'bg-gray-400'
            }`}>
              {status === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> :
               status === 'failed' ? offIcon :
               status === 'testing' ? <RefreshCw className="w-5 h-5 text-white animate-spin" /> :
               icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {status === 'failed' && (
            <button
              onClick={() => retryTest(testType)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
        
        {/* Audio level indicator for microphone test */}
        {testType === 'microphone' && isTestingAudio && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Speak to test your microphone</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${Math.min((audioLevel / 100) * 100, 100)}%` }}
                transition={{ type: 'tween', duration: 0.1 }}
              />
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-green-600"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Test passed!</span>
          </motion.div>
        )}
        
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Test failed. Please check your device settings.</span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pre-Interview System Check
          </h1>
          <p className="text-gray-600">
            Let's make sure everything is working properly before we start your interview
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { step: 1, label: 'Camera' },
            { step: 2, label: 'Face Detection' },
            { step: 3, label: 'Microphone' },
            { step: 4, label: 'Speakers' },
            { step: 5, label: 'Ready' }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                getStepStatus(item.step) === 'completed' ? 'bg-green-500 text-white' :
                getStepStatus(item.step) === 'active' ? 'bg-blue-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {getStepStatus(item.step) === 'completed' ? <CheckCircle className="w-5 h-5" /> : item.step}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">{item.label}</span>
              {index < 4 && <div className="w-12 h-0.5 bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Video Preview and Controls */}
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Preview</h3>
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none transform scale-x-[-1]"
                  style={{ zIndex: 10 }}
                />
                {deviceTests.camera !== 'success' && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <CameraOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Device Settings */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Device Settings</h3>
                <button
                  onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configure</span>
                </button>
              </div>
              
              <AnimatePresence>
                {showDeviceSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Camera Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Camera
                      </label>
                      <select
                        value={selectedDevices.camera}
                        onChange={(e) => setSelectedDevices(prev => ({ ...prev, camera: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availableDevices.cameras.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Microphone Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Microphone
                      </label>
                      <select
                        value={selectedDevices.microphone}
                        onChange={(e) => setSelectedDevices(prev => ({ ...prev, microphone: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availableDevices.microphones.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Device Tests */}
          <div className="space-y-6">
            {/* Step 1: Camera Test */}
            {currentStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderDeviceTest(
                  'camera',
                  <Camera className="w-5 h-5 text-white" />,
                  <CameraOff className="w-5 h-5 text-white" />,
                  'Camera Test',
                  'We need access to your camera for the video interview'
                )}
                
                {deviceTests.camera === 'pending' && currentStep === 1 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={testCamera}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Test Camera
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Face Detection Test */}
            {currentStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {renderDeviceTest(
                  'faceDetection',
                  <User className="w-5 h-5 text-white" />,
                  <UserX className="w-5 h-5 text-white" />,
                  'Face Detection Test',
                  'Please position your face clearly in the camera view'
                )}
                
                {deviceTests.faceDetection === 'testing' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {!faceDetectionInitialized 
                          ? "Loading face detection model..." 
                          : facesDetected > 0 
                            ? `Detecting face stability... (${facesDetected} face${facesDetected !== 1 ? 's' : ''} detected)`
                            : "Looking for your face..."
                        }
                      </span>
                    </div>
                    {!faceDetectionInitialized ? (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                          <span className="text-sm text-blue-600">
                            Initializing TensorFlow.js BlazeFace model...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-blue-600 mb-3">
                          {facesDetected > 0 
                            ? "Great! Keep your face steady for a few more seconds."
                            : "Position your face clearly in the camera view."
                          }
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${facesDetected > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 15 }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {deviceTests.faceDetection === 'success' && (
                  <div className="mt-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">Face detected successfully!</p>
                      <p className="text-sm text-green-600">You're ready for the video interview.</p>
                    </motion.div>
                  </div>
                )}
                
                {deviceTests.faceDetection === 'failed' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Face detection failed
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      We couldn't detect a stable face in the camera. Please ensure your face is clearly visible and try again.
                    </p>
                    <ul className="text-xs text-yellow-600 space-y-1 mb-3">
                      <li>• Position your face directly in front of the camera</li>
                      <li>• Ensure good lighting on your face (avoid backlighting)</li>
                      <li>• Remove any obstructions (dark glasses, masks, hats)</li>
                      <li>• Move closer to the camera if you're too far away</li>
                      <li>• Keep your head steady during the detection process</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Technical note:</strong> This system uses advanced AI face detection to ensure you're properly positioned for the video interview.
                      </p>
                    </div>
                  </div>
                )}
                
                {deviceTests.faceDetection === 'pending' && currentStep === 2 && faceDetectionInitialized && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={startFaceDetection}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Face Detection
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Click to begin checking if your face is visible in the camera
                    </p>
                  </div>
                )}
                
                {deviceTests.faceDetection === 'pending' && currentStep === 2 && !faceDetectionInitialized && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-blue-800 font-medium">Loading AI Model</p>
                    <p className="text-xs text-blue-600">Initializing TensorFlow.js face detection...</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Microphone Test */}
            {currentStep >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {renderDeviceTest(
                  'microphone',
                  <Mic className="w-5 h-5 text-white" />,
                  <MicOff className="w-5 h-5 text-white" />,
                  'Microphone Test',
                  'Speak clearly so the interviewer can hear you'
                )}
                
                {deviceTests.microphone === 'pending' && currentStep === 3 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={testMicrophone}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Test Microphone
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Speaker Test */}
            {currentStep >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {renderDeviceTest(
                  'speakers',
                  <Volume2 className="w-5 h-5 text-white" />,
                  <VolumeX className="w-5 h-5 text-white" />,
                  'Speaker Test',
                  'Make sure you can hear the interviewer clearly'
                )}
                
                {deviceTests.speakers === 'pending' && currentStep === 4 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={testSpeakers}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Test Speakers
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      You should hear a brief tone when testing
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Ready to Start */}
            {currentStep >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-green-50 border-2 border-green-500 rounded-lg p-6"
              >
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    System Check Complete!
                  </h3>
                  <p className="text-green-600 mb-4">
                    All devices are working properly. You're ready to start your interview.
                  </p>
                  
                  {/* Proctoring Notice */}
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-800 font-medium">Session Monitoring</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      This interview session will be monitored for integrity. Please refrain from switching tabs or windows during the interview.
                    </p>
                  </div>
                  
                  {isFullScreenSupported && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Monitor className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">Full Screen Mode</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        The interview will automatically enter full screen mode for better focus and professionalism.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      // Clean up test streams before starting interview
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => {
                          track.stop();
                          console.log('Stopped pre-interview test stream track:', track.kind);
                        });
                        streamRef.current = null;
                      }
                      if (audioContextRef.current) {
                        audioContextRef.current.close();
                      }
                      if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                      }
                      onStartInterview();
                    }}
                    className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Interview</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        {Object.values(deviceTests).some(status => status === 'failed') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6"
          >
            <h3 className="font-semibold text-yellow-800 mb-3">Troubleshooting Tips</h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Make sure your browser has permission to access camera and microphone</li>
              <li>• Check that no other applications are using your camera or microphone</li>
              <li>• Try refreshing the page and allowing permissions when prompted</li>
              <li>• Ensure your devices are properly connected and not muted</li>
              <li>• For speakers, check your system volume and audio output settings</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PreInterviewCheck;