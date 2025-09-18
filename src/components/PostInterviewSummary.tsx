import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Trophy, 
  Clock, 
  Target, 
  Users, 
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Download,
  Share2,
  Home,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import type { PostInterviewData } from '../types';

interface PostInterviewSummaryProps {
  interviewData: PostInterviewData;
  onBackToDashboard: () => void;
}

const PostInterviewSummary: React.FC<PostInterviewSummaryProps> = ({
  interviewData,
  onBackToDashboard
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on component mount
    const timer = setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Hire': return 'bg-green-600 text-green-100';
      case 'Hire': return 'bg-blue-600 text-blue-100';
      case 'No Hire': return 'bg-orange-600 text-orange-100';
      case 'Strong No Hire': return 'bg-red-600 text-red-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Confetti animation component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
          }}
          initial={{ y: -10, rotate: 0 }}
          animate={{
            y: window.innerHeight + 10,
            rotate: 360,
            x: Math.random() * 200 - 100,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {showConfetti && <Confetti />}
      
      <div className="relative min-h-screen flex flex-col">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 p-6"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Interview Complete!
                </h1>
                <p className="text-gray-300 text-sm">
                  {interviewData.position} • {new Date(interviewData.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Results</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 relative z-10 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Welcome Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
              >
                Thank You, {interviewData.candidateName}!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              >
                You've successfully completed your interview for <span className="text-blue-400 font-semibold">{interviewData.position}</span>. 
                We appreciate the time and effort you put into this process.
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center space-x-8 mt-8 text-sm text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {formatDuration(interviewData.duration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Interviewer: {interviewData.interviewer}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{interviewData.performance.answeredQuestions}/{interviewData.performance.totalQuestions} Questions</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Interview Completion Status */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mb-4 md:mb-6"
                >
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl md:text-2xl font-bold text-green-400 mb-2"
                >
                  Interview Status: Completed ✓
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-gray-400 text-sm md:text-base"
                >
                  Your interview session has been successfully completed and recorded.
                </motion.p>
                
                {/* Interview Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
                >
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-gray-300 font-medium">Duration</div>
                    <div className="text-white">{formatDuration(interviewData.duration)}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <Target className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-gray-300 font-medium">Questions</div>
                    <div className="text-white">{interviewData.performance.answeredQuestions}/{interviewData.performance.totalQuestions} Answered</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <Users className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <div className="text-gray-300 font-medium">Interviewer</div>
                    <div className="text-white">{interviewData.interviewer}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Feedback Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl md:text-2xl font-bold">Interview Feedback</h3>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getRecommendationColor(interviewData.feedback.recommendation)}`}>
                  {interviewData.feedback.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Strengths */}
                <motion.div 
                  className="space-y-4"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="w-5 h-5 text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-green-400">Key Strengths</h4>
                  </div>
                  <div className="space-y-3">
                    {interviewData.feedback.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg hover:border-green-400/50 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200 leading-relaxed">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Areas for Improvement */}
                <motion.div 
                  className="space-y-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-yellow-400">Growth Opportunities</h4>
                  </div>
                  <div className="space-y-3">
                    {interviewData.feedback.areasForImprovement.map((area, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg hover:border-yellow-400/50 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200 leading-relaxed">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Interview Notes */}
              {interviewData.feedback.specificNotes && interviewData.feedback.specificNotes.length > 0 && (
                <motion.div 
                  className="mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Additional Notes</span>
                  </h4>
                  <div className="space-y-3">
                    {interviewData.feedback.specificNotes.map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg"
                      >
                        <span className="text-gray-200 leading-relaxed">{note}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl md:text-2xl font-bold">What's Next?</h3>
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                {interviewData.feedback.nextRound && (
                  <div className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full text-sm font-semibold text-green-400">
                    Next Round Scheduled
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-purple-400">Timeline</h4>
                  <p className="text-gray-300 leading-relaxed">{interviewData.nextSteps.timeline}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-green-900/30 border border-blue-500/30 rounded-lg hover:border-blue-400/50 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-blue-400">Contact</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{interviewData.nextSteps.contact}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-6 bg-gradient-to-br from-green-900/30 to-purple-900/30 border border-green-500/30 rounded-lg hover:border-green-400/50 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  {interviewData.feedback.nextRound ? (
                    <>
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-green-400">Next Round</h4>
                      <p className="text-gray-300 leading-relaxed">{interviewData.feedback.nextRound}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-gray-400">Stay Tuned</h4>
                      <p className="text-gray-300 leading-relaxed">We'll be in touch soon with updates</p>
                    </>
                  )}
                </motion.div>
              </div>

              {interviewData.nextSteps.additionalInfo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-indigo-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold text-indigo-400 mb-2">Additional Information</h4>
                      <p className="text-gray-300 leading-relaxed">{interviewData.nextSteps.additionalInfo}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Final Thank You */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-center py-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl"
              >
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Thank you for your time and effort!
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We genuinely appreciate your interest in joining our team. Your responses showed great insight and 
                  we're impressed by your passion for technology. Regardless of the outcome, we wish you the very best 
                  in your career journey.
                </p>
                
                <div className="mt-6 flex justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBackToDashboard}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Home className="w-5 h-5" />
                    <span>Return to Dashboard</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInterviewSummary;