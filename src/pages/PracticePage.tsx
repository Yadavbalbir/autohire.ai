import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, CheckCircle, Code, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import db, { type Problem } from '../database';

const PracticePage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('// Write your solution here\n');
  const [isRunning, setIsRunning] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load problems from database
    const loadedProblems = db.getProblems();
    setProblems(loadedProblems);
    // Initialize code with template when problem is selected
    if (selectedProblem?.template) {
      setCode(selectedProblem.template);
    }
  }, [selectedProblem]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      // Simulate code execution
      console.log('Code executed:', code);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (selectedProblem) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() => setSelectedProblem(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Problems</span>
              </button>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-70"
                >
                  {isRunning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problem and Code Editor */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">{selectedProblem.title}</h1>
              </div>
              <div className="p-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedProblem.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Examples</h3>
                    <div className="space-y-4">
                      {selectedProblem.examples.map((example, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Input: </span>
                              <code className="text-sm text-gray-900 bg-gray-100 px-1 rounded">{example.input}</code>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Output: </span>
                              <code className="text-sm text-gray-900 bg-gray-100 px-1 rounded">{example.output}</code>
                            </div>
                            {example.explanation && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Explanation: </span>
                                <span className="text-sm text-gray-600">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Constraints</h3>
                    <ul className="space-y-1">
                      {selectedProblem.constraints.map((constraint, index) => (
                        <li key={index} className="text-sm text-gray-700">• {constraint}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Code className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Solution</span>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C++</option>
                  </select>
                </div>
              </div>
              <div className="h-full">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none"
                  placeholder="Write your solution here..."
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Practice Problems</h1>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coding Practice</h2>
          <p className="text-gray-600">
            Sharpen your problem-solving skills with these curated coding challenges
          </p>
        </motion.div>

        {/* Problems Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-6"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProblem(problem)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {problem.description}
                    </p>
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>~30 min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>0% solved</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Hint available</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-blue-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Practice Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Start with easier problems to build confidence</li>
            <li>• Read the problem statement carefully before coding</li>
            <li>• Think about edge cases and test your solution</li>
            <li>• Don't hesitate to use hints if you're stuck</li>
            <li>• Practice regularly to improve your problem-solving speed</li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default PracticePage;
