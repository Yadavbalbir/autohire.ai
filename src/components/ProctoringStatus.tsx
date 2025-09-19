import React from 'react';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import type { ProctoringViolation } from '../hooks/useProctoringViolations';

interface ProctoringStatusProps {
  isActive: boolean;
  violations: ProctoringViolation[];
  violationCount: number;
}

const ProctoringStatus: React.FC<ProctoringStatusProps> = ({
  isActive,
  violationCount
}) => {
  const getStatusColor = () => {
    if (!isActive) return 'text-gray-500';
    if (violationCount === 0) return 'text-green-500';
    if (violationCount <= 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (!isActive) return 'Proctoring Inactive';
    if (violationCount === 0) return 'Proctoring Active';
    return `Proctoring Active - ${violationCount} Alert${violationCount > 1 ? 's' : ''}`;
  };

  const getStatusIcon = () => {
    if (!isActive) return <Shield className="w-4 h-4 text-gray-500" />;
    if (violationCount === 0) return <Eye className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      {/* Main Status */}
      <div className="flex items-center space-x-2 mb-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Status Light */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div 
            className={`w-2 h-2 rounded-full ${
              isActive 
                ? violationCount === 0 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-yellow-500'
                : 'bg-gray-500'
            }`}
          />
          {isActive && (
            <div 
              className={`absolute inset-0 w-2 h-2 rounded-full animate-ping ${
                violationCount === 0 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
          )}
        </div>
        <span className="text-xs text-gray-400">
          {isActive ? 'Monitoring session' : 'Session not monitored'}
        </span>
      </div>

      {/* Alert Details Removed - Only showing count in main status text */}
    </div>
  );
};

export default ProctoringStatus;