import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  Phone,
  Video,
  FileText,
  Target,
  Star,
  Zap,
  Play,
  Briefcase
} from 'lucide-react';
import type { Interview } from '../database';

interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onStartInterview?: () => void;
  showStartButton?: boolean;
}

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  isOpen,
  onClose,
  interview,
  onStartInterview,
  showStartButton = false
}) => {
  if (!interview) return null;

  const canStartInterview = (dateString: string) => {
    const interviewDate = new Date(dateString);
    const now = new Date();
    const timeDiff = interviewDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    // Allow starting 5 minutes before scheduled time
    return minutesDiff <= 5 && minutesDiff > -60; // Also allow up to 1 hour after scheduled time
  };

  const getTimeUntilStartAvailable = (dateString: string) => {
    const interviewDate = new Date(dateString);
    const startAvailableTime = new Date(interviewDate.getTime() - (5 * 60 * 1000)); // 5 minutes before
    const now = new Date();
    const timeDiff = startAvailableTime.getTime() - now.getTime();
    
    if (canStartInterview(dateString)) {
      return { canStart: true, message: "Interview is ready to start!" };
    }
    
    if (timeDiff <= 0) {
      return { canStart: false, message: "Interview time has passed" };
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return { 
        canStart: false, 
        message: `Available to start in ${hours}h ${minutes}m (5 minutes before scheduled time)` 
      };
    } else {
      return { 
        canStart: false, 
        message: `Available to start in ${minutes} minutes (5 minutes before scheduled time)` 
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getInterviewTypeInfo = (type: string) => {
    const typeMap: Record<string, { color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
      technical: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <Zap className="w-6 h-6" />,
        description: 'Technical skills and problem-solving assessment'
      },
      behavioral: {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: <User className="w-6 h-6" />,
        description: 'Communication and cultural fit evaluation'
      },
      system_design: {
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: <Target className="w-6 h-6" />,
        description: 'System architecture and design thinking'
      },
      cultural_fit: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: <Star className="w-6 h-6" />,
        description: 'Team dynamics and company culture alignment'
      },
      coding: {
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200',
        icon: <Zap className="w-6 h-6" />,
        description: 'Live coding and algorithm problem solving'
      },
      program_management: {
        color: 'text-pink-600',
        bgColor: 'bg-pink-50 border-pink-200',
        icon: <Briefcase className="w-6 h-6" />,
        description: 'Program management and leadership skills'
      },
      strategic_thinking: {
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 border-cyan-200',
        icon: <Target className="w-6 h-6" />,
        description: 'Strategic planning and decision making'
      },
      leadership: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: <Star className="w-6 h-6" />,
        description: 'Leadership and mentoring capabilities'
      }
    };

    return typeMap[type] || typeMap.technical;
  };

  const getFormatInfo = (format: string) => {
    const formatMap: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
      video_call: {
        icon: <Video className="w-4 h-4" />,
        label: 'Video Call',
        color: 'text-blue-600'
      },
      phone_call: {
        icon: <Phone className="w-4 h-4" />,
        label: 'Phone Call',
        color: 'text-green-600'
      },
      in_person: {
        icon: <MapPin className="w-4 h-4" />,
        label: 'In Person',
        color: 'text-purple-600'
      }
    };

    return formatMap[format] || formatMap.video_call;
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rescheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return statusMap[status] || statusMap.scheduled;
  };

  const { date, time } = formatDate(interview.scheduledDate);
  const typeInfo = getInterviewTypeInfo(interview.type);
  const formatInfo = getFormatInfo(interview.format);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className={`relative px-8 py-6 ${typeInfo.bgColor} border-b-2 ${typeInfo.color.replace('text-', 'border-')}`}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header content */}
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${typeInfo.color} bg-white rounded-xl shadow-sm`}>
                  {typeInfo.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Interview Details
                  </h2>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${typeInfo.color} ${typeInfo.bgColor.replace('50', '100')}`}>
                      {interview.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(interview.status)}`}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {typeInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="p-8 space-y-8">
              {/* Candidate Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Candidate Information</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {interview.candidateName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{interview.candidateName}</p>
                          <p className="text-sm text-gray-600">Candidate</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{interview.candidateEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-gray-900 mb-2">Position</h4>
                      <p className="text-blue-600 font-semibold">{interview.position}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Interview Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Schedule & Format</span>
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-gray-900">Date</h4>
                    </div>
                    <p className="text-sm text-gray-600">{date}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-gray-900">Time</h4>
                    </div>
                    <p className="text-sm text-gray-600">{time}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      {formatInfo.icon}
                      <h4 className="font-medium text-gray-900">Format</h4>
                    </div>
                    <p className={`text-sm font-medium ${formatInfo.color}`}>{formatInfo.label}</p>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Duration</h4>
                  </div>
                  <p className="text-sm text-gray-600">{interview.duration} minutes</p>
                </div>
              </motion.div>

              {/* Interview Start Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`rounded-xl p-6 border ${
                  getTimeUntilStartAvailable(interview.scheduledDate).canStart 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Play className={`w-5 h-5 ${
                    getTimeUntilStartAvailable(interview.scheduledDate).canStart ? 'text-green-600' : 'text-amber-600'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900">Interview Status</h3>
                </div>
                <div className={`rounded-lg p-4 border ${
                  getTimeUntilStartAvailable(interview.scheduledDate).canStart 
                    ? 'bg-white border-green-200'
                    : 'bg-white border-amber-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    getTimeUntilStartAvailable(interview.scheduledDate).canStart ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {getTimeUntilStartAvailable(interview.scheduledDate).message}
                  </p>
                </div>
              </motion.div>

              {/* Interviewer Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>Interviewer</span>
                </h3>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {interview.interviewerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{interview.interviewerName}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{interview.interviewerEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Notes Section */}
              {interview.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>Interview Notes</span>
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-gray-700 leading-relaxed">{interview.notes}</p>
                  </div>
                </motion.div>
              )}

              {/* Reminder Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-cyan-600" />
                  <span>Reminders</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-cyan-200">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${interview.reminders.candidate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Candidate Reminder: {interview.reminders.candidate ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-cyan-200">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${interview.reminders.interviewer ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Interviewer Reminder: {interview.reminders.interviewer ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
              {showStartButton && interview.status === 'scheduled' && (
                <button
                  onClick={canStartInterview(interview.scheduledDate) ? onStartInterview : undefined}
                  disabled={!canStartInterview(interview.scheduledDate)}
                  className={`flex items-center space-x-2 px-6 py-2 font-medium rounded-lg transition-all duration-200 ${
                    canStartInterview(interview.scheduledDate)
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={canStartInterview(interview.scheduledDate) ? 'Start Interview' : 'Interview can only be started 5 minutes before scheduled time'}
                >
                  <Play className="w-4 h-4" />
                  <span>{canStartInterview(interview.scheduledDate) ? 'Start Interview' : 'Not Ready'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InterviewDetailsModal;