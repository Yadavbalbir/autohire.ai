import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Save, Code2, CheckCircle, AlertCircle, Download, X } from 'lucide-react';

interface InterviewQuestion {
  id: string;
  type: 'behavioral' | 'technical' | 'coding' | 'system_design';
  question: string;
  description?: string;
  hints?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface CodeEditorProps {
  question: InterviewQuestion;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ question }) => {
  const [code, setCode] = useState(`// ${question.question}
// Write your solution here

function solution() {
    // Your implementation
    
    return null;
}

// Test your solution
console.log(solution());`);
  
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [testResults, setTestResults] = useState<{passed: number, failed: number} | null>(null);
  const editorRef = useRef<any>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  ];

  const getLanguageTemplate = (lang: string, questionText: string) => {
    switch (lang) {
      case 'python':
        return `# ${questionText}
# Write your solution here

def solution():
    # Your implementation
    
    return None

# Test your solution
print(solution())`;
      
      case 'java':
        return `// ${questionText}
// Write your solution here

public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
    
    public Object solution() {
        // Your implementation
        
        return null;
    }
}`;
      
      case 'cpp':
        return `// ${questionText}
// Write your solution here

#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    // Your implementation
    void solution() {
        
    }
};

int main() {
    Solution sol;
    sol.solution();
    return 0;
}`;
      
      case 'typescript':
        return `// ${questionText}
// Write your solution here

function solution(): any {
    // Your implementation
    
    return null;
}

// Test your solution
console.log(solution());`;
      
      default: // javascript
        return `// ${questionText}
// Write your solution here

function solution() {
    // Your implementation
    
    return null;
}

// Test your solution
console.log(solution());`;
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(getLanguageTemplate(newLanguage, question.question));
    setOutput('');
    setTestResults(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    setShowOutputModal(true);
    
    // Simulate code execution
    setTimeout(() => {
      try {
        // This is a mock execution - in real implementation, you'd send to a code execution service
        const mockOutput = `Output for ${language}:\n`;
        
        if (language === 'javascript' || language === 'typescript') {
          setOutput(mockOutput + 'Code executed successfully!\nResult: [Implementation needed]');
        } else if (language === 'python') {
          setOutput(mockOutput + 'Code executed successfully!\nResult: Implementation needed');
        } else if (language === 'java') {
          setOutput(mockOutput + 'Compilation successful!\nResult: Implementation needed');
        } else if (language === 'cpp') {
          setOutput(mockOutput + 'Compilation and execution successful!\nResult: Implementation needed');
        }
        
        // Mock test results
        setTestResults({ passed: 2, failed: 1 });
      } catch (error) {
        setOutput(`Error: ${error}`);
        setTestResults({ passed: 0, failed: 3 });
      }
      setIsRunning(false);
    }, 2000);
  };

  const handleResetCode = () => {
    setCode(getLanguageTemplate(language, question.question));
    setOutput('');
    setTestResults(null);
    setIsSaved(false);
    setShowOutputModal(false);
  };

  const handleSaveCode = () => {
    // Simulate saving
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    
    // In real implementation, save to interview session
    console.log('Saving code for question:', question.id);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `interview_${question.id}.${language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Code Editor</h3>
        </div>

        {/* Controls - All in one line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Language Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Run</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetCode}
              className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSaveCode}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSaved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCode}
              className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="flex items-center space-x-3 text-sm">
              {testResults.passed > 0 && (
                <span className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>{testResults.passed} passed</span>
                </span>
              )}
              {testResults.failed > 0 && (
                <span className="flex items-center space-x-1 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{testResults.failed} failed</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              insertSpaces: true,
              renderLineHighlight: 'all',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              parameterHints: { enabled: true },
            }}
          />
        </div>

      {/* Output Modal Overlay */}
      {showOutputModal && output && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <h3 className="text-lg font-semibold text-white">Code Execution Output</h3>
                {testResults && (
                  <div className="flex items-center space-x-3 text-sm">
                    {testResults.passed > 0 && (
                      <span className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>{testResults.passed} passed</span>
                      </span>
                    )}
                    {testResults.failed > 0 && (
                      <span className="flex items-center space-x-1 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>{testResults.failed} failed</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowOutputModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap bg-gray-950 rounded-lg p-4 border border-gray-700">
                {output}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowOutputModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Again</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;