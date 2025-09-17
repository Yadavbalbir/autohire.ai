import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Code2, 
  PenTool, 
  LogOut,
  Bot,
  User,
  Maximize,
  Minimize
} from 'lucide-react';
import { db } from '../database';
import type { Interview } from '../database';
import { PreInterviewCheck, AIAgent, CodeEditor, Whiteboard } from '../components';
import { useFullScreen } from '../hooks/useFullScreen';

type InterviewMode = 'discussion' | 'coding' | 'whiteboard';

interface InterviewQuestion {
  id: string;
  type: 'behavioral' | 'technical' | 'coding' | 'system_design';
  question: string;
  description?: string;
  hints?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

const mockQuestions: InterviewQuestion[] = [
  {
    id: '1',
    type: 'behavioral',
    question: 'Tell me about yourself and your background in software development.',
    description: 'This is an introductory question to understand your experience and background.',
    difficulty: 'easy'
  },
  {
    id: '2',
    type: 'technical',
    question: 'What is the difference between REST and GraphQL?',
    description: 'Explain the key differences between these two API approaches.',
    difficulty: 'medium'
  },
  {
    id: '3',
    type: 'coding',
    question: 'Implement a function to reverse a string without using built-in reverse methods.',
    description: 'Write a function that takes a string as input and returns the reversed string.',
    hints: ['Consider using two pointers', 'You can convert string to array first'],
    difficulty: 'easy'
  },
  {
    id: '4',
    type: 'system_design',
    question: 'Design a URL shortening service like bit.ly',
    description: 'Design the architecture for a scalable URL shortening service.',
    hints: ['Consider database design', 'Think about scaling', 'URL encoding strategies'],
    difficulty: 'hard'
  }
];

const InterviewPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { isFullScreen, enterFullScreen, exitFullScreen, toggleFullScreen } = useFullScreen();
  
  // Interview state
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(mockQuestions[0]);
  const [mode, setMode] = useState<InterviewMode>('discussion');
  const [agentSpeechText, setAgentSpeechText] = useState<string>('Hello! Welcome to your interview. I\'m your AI interviewer today.');
  
  // Interview phases
  const [interviewPhase, setInterviewPhase] = useState<'setup' | 'interview'>('setup');
  
  // Video controls
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  // Video stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  
  // Load interview data
  useEffect(() => {
    if (interviewId) {
      const interviewData = db.getInterviews().find(i => i.id === interviewId);
      if (interviewData) {
        setInterview(interviewData);
      } else {
        navigate('/dashboard');
      }
    }
  }, [interviewId, navigate]);

  // Handle pre-interview check completion
  const handlePreInterviewComplete = () => {
    setInterviewPhase('interview');
    // Enter full screen mode when interview starts
    enterFullScreen();
  };

  // Initialize video stream
  const initializeVideoStream = async () => {
    try {
      setVideoError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setVideoError('Unable to access camera/microphone');
    }
  };

  // Clean up video stream
  const cleanupVideoStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Initialize video when entering interview phase
  useEffect(() => {
    if (interviewPhase === 'interview') {
      initializeVideoStream();
    }
    
    // Cleanup on unmount
    return () => {
      cleanupVideoStream();
    };
  }, [interviewPhase]);

  // Simulate AI agent controlling question flow
  useEffect(() => {
    const questionTimer = setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setCurrentQuestion(mockQuestions[nextIndex]);
        
        // Update agent speech and mode based on question type
        const nextQuestion = mockQuestions[nextIndex];
        if (nextQuestion.type === 'coding') {
          setMode('coding');
          setAgentSpeechText('Now let\'s test your coding skills. Please solve this programming challenge.');
        } else if (nextQuestion.type === 'system_design') {
          setMode('whiteboard');
          setAgentSpeechText('Time for system design! Use the whiteboard to illustrate your solution.');
        } else {
          setMode('discussion');
          setAgentSpeechText('Let\'s continue with the next question...');
        }
      }
    }, 45000); // Change question every 45 seconds

    return () => clearTimeout(questionTimer);
  }, [currentQuestionIndex]);

  const handleEndInterview = () => {
    // Exit full screen when interview ends
    exitFullScreen();
    navigate('/dashboard');
  };

  const handleModeChange = (newMode: InterviewMode) => {
    setMode(newMode);
    if (newMode === 'coding') {
      setAgentSpeechText('Great! Let me see how you approach coding problems.');
    } else if (newMode === 'whiteboard') {
      setAgentSpeechText('Perfect! Please use the whiteboard to explain your solution visually.');
    } else {
      setAgentSpeechText('Let\'s continue our discussion about this topic.');
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading interview...</div>
      </div>
    );
  }

  // Show pre-interview check first
  if (interviewPhase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-900">
        <PreInterviewCheck
          onStartInterview={handlePreInterviewComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-lg font-semibold text-white">
              Interview: {interview.position}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFullScreen}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${interview.status === 'scheduled' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-300">Live Interview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Side - Video Feeds and Question */}
        <div className="w-1/2 bg-gray-900 p-6 flex flex-col">
          {/* Video Feeds Container - Upper section */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* AI Agent Video - Small Square */}
              <div className="relative">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500">
                  <AIAgent 
                    isSpeaking={false}
                  />
                </div>
                <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white font-medium">AI Interviewer</span>
                </div>
                {/* Agent Speech Text Overlay */}
                <motion.div
                  key={agentSpeechText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-0 right-0 bg-blue-900/90 backdrop-blur-sm rounded-lg p-2"
                >
                  <p className="text-xs text-blue-100 text-center">{agentSpeechText}</p>
                </motion.div>
              </div>

              {/* Candidate Video - Small Square */}
              <div className="relative">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-green-500 relative">
                  {/* Candidate video feed */}
                  {videoError ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-900/50">
                      <div className="text-center text-red-400">
                        <VideoOff className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">{videoError}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                        onLoadedData={() => console.log('Video loaded successfully')}
                      />
                      
                      {/* Live indicator */}
                      <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                      
                      {/* Quality indicator */}
                      <div className="absolute top-2 right-2 bg-black/50 text-green-400 px-2 py-1 rounded text-xs">
                        HD
                      </div>
                    </>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white font-medium">You</span>
                </div>
                {/* Video Controls */}
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <button
                    onClick={toggleCamera}
                    className={`p-1 rounded ${isCameraEnabled ? 'bg-green-600' : 'bg-red-600'} text-white hover:opacity-80 transition-opacity`}
                  >
                    {isCameraEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className={`p-1 rounded ${isAudioEnabled ? 'bg-green-600' : 'bg-red-600'} text-white hover:opacity-80 transition-opacity`}
                  >
                    {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question Display */}
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQuestion.type === 'behavioral' ? 'bg-purple-600' :
                  currentQuestion.type === 'technical' ? 'bg-blue-600' :
                  currentQuestion.type === 'coding' ? 'bg-green-600' : 'bg-orange-600'
                }`}>
                  {currentQuestion.type.replace('_', ' ').toUpperCase()}
                </span>
                {currentQuestion.difficulty && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-700' : 'bg-red-700'
                  }`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {currentQuestion.question}
              </h3>
              {currentQuestion.description && (
                <p className="text-gray-300 mb-4">
                  {currentQuestion.description}
                </p>
              )}
              {currentQuestion.hints && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-400">Hints:</h4>
                  <ul className="space-y-1">
                    {currentQuestion.hints.map((hint, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Question Progress */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-blue-400">
                  {Math.round(((currentQuestionIndex + 1) / mockQuestions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Code Editor / Whiteboard */}
        <div className="w-1/2 bg-gray-800 border-l border-gray-700">
          <AnimatePresence mode="wait">
            {mode === 'coding' && (
              <motion.div
                key="coding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <CodeEditor question={currentQuestion} />
              </motion.div>
            )}
            
            {mode === 'whiteboard' && (
              <motion.div
                key="whiteboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <Whiteboard question={currentQuestion} />
              </motion.div>
            )}
            
            {mode === 'discussion' && (
              <motion.div
                key="discussion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Discussion Mode</h3>
                    <p className="text-gray-400">
                      Answer the question verbally. The AI agent is listening to your response.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400">AI is actively listening</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Interview Tools:</span>
            
            <button
              onClick={() => handleModeChange('discussion')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'discussion' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Discussion</span>
            </button>

            <button
              onClick={() => handleModeChange('coding')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'coding' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => handleModeChange('whiteboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'whiteboard' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Whiteboard</span>
            </button>
          </div>

          <button
            onClick={handleEndInterview}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>End Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;