import { motion } from 'framer-motion';
import { Play, Zap, User, LogOut, Clock, Target, Calendar, Video, Phone, MapPin, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../database';
import type { Interview } from '../database';
import { InterviewDetailsModal } from '../components';

const CandidateDashboard: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      // Get interviews for the current candidate
      const allInterviews = db.getInterviews();
      const candidateInterviews = allInterviews.filter(
        interview => interview.candidateEmail === session.user.email && interview.status === 'scheduled'
      );
      setInterviews(candidateInterviews);
      setLoading(false);
    }
  }, [session?.user?.email]);

  const handleStartPractice = () => {
    navigate('/practice');
  };

  const handleQuickStart = () => {
    // Handle quick start functionality
    console.log('Starting quick session');
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInterview(null);
  };

  const handleStartInterview = () => {
    if (selectedInterview) {
      navigate(`/interview/${selectedInterview.id}`);
      setIsModalOpen(false);
      setSelectedInterview(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return <Target className="w-4 h-4" />;
      case 'behavioral':
        return <User className="w-4 h-4" />;
      case 'system_design':
        return <Zap className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video_call':
        return <Video className="w-4 h-4" />;
      case 'phone_call':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'behavioral':
        return 'bg-green-100 text-green-800';
      case 'system_design':
        return 'bg-purple-100 text-purple-800';
      case 'cultural_fit':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isInterviewSoon = (dateString: string) => {
    const interviewDate = new Date(dateString);
    const now = new Date();
    const timeDiff = interviewDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24 && hoursDiff > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">AutoHire.ai</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{session?.user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user.email.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Ready to ace your next technical interview? Let's get started.
          </p>
        </motion.div>

        {/* Upcoming Interviews Section */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Your Upcoming Interviews</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => {
                const { date, time } = formatDate(interview.scheduledDate);
                const isSoon = isInterviewSoon(interview.scheduledDate);
                
                return (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-xl shadow-lg border-l-4 ${
                      isSoon ? 'border-l-orange-500' : 'border-l-blue-500'
                    } p-6 hover:shadow-xl transition-shadow`}
                  >
                    {isSoon && (
                      <div className="flex items-center space-x-1 text-orange-600 text-sm font-medium mb-3">
                        <AlertCircle className="w-4 h-4" />
                        <span>Starting soon!</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {interview.position}
                        </h4>
                        <p className="text-sm text-gray-600">
                          with {interview.interviewerName}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(interview.type)}`}>
                        <div className="flex items-center space-x-1">
                          {getInterviewTypeIcon(interview.type)}
                          <span className="capitalize">{interview.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{time} ({interview.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getFormatIcon(interview.format)}
                        <span className="capitalize">{interview.format.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(interview)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => navigate(`/interview/${interview.id}`)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Interview</span>
                      </button>
                    </div>

                    {interview.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <strong>Notes:</strong> {interview.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* No Interviews Message */}
        {interviews.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
          >
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">No Upcoming Interviews</h3>
            <p className="text-blue-700">
              You don't have any scheduled interviews at the moment. Use the practice section to prepare for future opportunities!
            </p>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Start Practice Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Start Practice
              </h3>
              <p className="text-gray-600 mb-6">
                Practice coding problems and improve your technical skills with our interactive environment.
              </p>
              
              <button
                onClick={handleStartPractice}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Practice</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Start Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  Fast Track
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quick Start
              </h3>
              <p className="text-gray-600 mb-6">
                Jump into a quick assessment session to test your current skill level.
              </p>
              
              <button
                onClick={handleQuickStart}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Quick Start</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Interview Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Interview Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {db.getInterviews().filter(i => i.candidateEmail === session?.user.email && i.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled Interviews</div>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {db.getInterviews().filter(i => i.candidateEmail === session?.user.email && i.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Attempted Interviews</div>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {db.getInterviews().filter(i => i.candidateEmail === session?.user.email && i.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Qualified Interviews</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Interview Details Modal */}
      <InterviewDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        interview={selectedInterview}
        onStartInterview={handleStartInterview}
        showStartButton={true}
      />
    </div>
  );
};

export default CandidateDashboard;
