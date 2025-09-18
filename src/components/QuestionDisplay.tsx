import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, Lightbulb, Clock, Target } from 'lucide-react';

interface InterviewQuestion {
  id: string;
  type: 'behavioral' | 'technical' | 'coding' | 'system_design';
  question: string;
  description?: string;
  hints?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface QuestionDisplayProps {
  question: InterviewQuestion;
  isAgentSpeaking: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, isAgentSpeaking }) => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral':
        return <MessageSquare className="w-5 h-5" />;
      case 'technical':
        return <HelpCircle className="w-5 h-5" />;
      case 'coding':
        return <Target className="w-5 h-5" />;
      case 'system_design':
        return <Target className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coding':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'system_design':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Question Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getTypeColor(question.type)}`}>
              {getQuestionTypeIcon(question.type)}
              <span className="capitalize">{question.type.replace('_', ' ')}</span>
            </div>
            
            {question.difficulty && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(question.difficulty)}`}></div>
                <span className="text-sm text-gray-400 capitalize">{question.difficulty}</span>
              </div>
            )}
          </div>

          {isAgentSpeaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 text-green-400"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">AI is speaking...</span>
            </motion.div>
          )}
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-white leading-relaxed"
        >
          {question.question}
        </motion.h2>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Description */}
          {question.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-400 mb-2">Context</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {question.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-400 mb-3">Hints</h3>
                  <ul className="space-y-2">
                    {question.hints.map((hint, index) => (
                      <li key={index} className="text-gray-300 text-sm leading-relaxed flex items-start space-x-2">
                        <span className="text-yellow-400 font-bold flex-shrink-0 mt-1">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Discussion Area Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[200px]"
          >
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Discussion Area</h3>
              <p className="text-gray-400 text-sm mb-4">
                This is where you can have a conversation with the AI interviewer about the question.
              </p>
              <div className="text-xs text-gray-500 bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Take your time to think and respond</span>
                </div>
                <p>
                  You can speak your answer out loud, and the AI will listen and provide feedback.
                  Use the controls below to switch to coding or whiteboard mode when needed.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Additional Tips for Different Question Types */}
          {question.type === 'coding' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-purple-900/30 border border-purple-700 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-purple-400 mb-2">Coding Question Tips</h3>
                  <p className="text-gray-300 text-sm">
                    Click the "Code Editor" button below to open the coding environment. 
                    You can write, test, and explain your solution step by step.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {question.type === 'system_design' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-orange-900/30 border border-orange-700 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-orange-400 mb-2">System Design Tips</h3>
                  <p className="text-gray-300 text-sm">
                    Use the "Whiteboard" button to draw diagrams, system architecture, 
                    and explain your design visually.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;