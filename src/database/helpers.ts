// Database initialization and helper utilities
import db from './index';

// Initialize database on app start
export const initializeDatabase = () => {
  try {
    // Test database access
    const candidates = db.getCandidates();
    const interviews = db.getInterviews();
    const problems = db.getProblems();
    const adminData = db.getAdminData();
    
    console.log('Database initialized successfully:', {
      candidates: candidates.length,
      interviews: interviews.length, 
      problems: problems.length,
      adminLoaded: !!adminData
    });
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

// Helper functions for common database operations
export const addNewCandidate = (candidateData: {
  email: string;
  name: string;
  phone?: string;
  position: string;
  experience?: string;
  skills?: string[];
  resume?: string;
  notes?: string;
}) => {
  const candidate = db.addCandidate({
    ...candidateData,
    phone: candidateData.phone || '',
    experience: candidateData.experience || '',
    skills: candidateData.skills || [],
    resume: candidateData.resume || '',
    status: 'active' as const,
    appliedDate: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    practiceScores: {
      totalSessions: 0,
      averageScore: 0,
      completedProblems: 0,
      bestScore: 0
    },
    notes: candidateData.notes || ''
  });
  
  return candidate;
};

export const scheduleInterview = (interviewData: {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  interviewerName: string;
  interviewerEmail: string;
  scheduledDate: string;
  duration?: number;
  type: 'technical' | 'behavioral' | 'system_design' | 'cultural_fit';
  format: 'video_call' | 'phone_call' | 'in_person';
  notes?: string;
}) => {
  const interview = db.addInterview({
    ...interviewData,
    duration: interviewData.duration || 60,
    status: 'scheduled' as const,
    notes: interviewData.notes || '',
    reminders: {
      candidate: true,
      interviewer: true,
      reminderSent: false
    }
  });
  
  return interview;
};

export const startPracticeSession = (sessionData: {
  candidateId: string;
  candidateEmail: string;
  problemId: string;
  problemTitle: string;
}) => {
  const session = db.addPracticeSession({
    ...sessionData,
    startedAt: new Date().toISOString(),
    completedAt: null,
    timeSpent: 0,
    score: 0,
    status: 'in_progress' as const,
    attempts: 1,
    solution: '',
    notes: ''
  });
  
  return session;
};

export const completePracticeSession = (sessionId: string, solution: string, score: number) => {
  const session = db.updatePracticeSession(sessionId, {
    completedAt: new Date().toISOString(),
    status: 'completed' as const,
    solution,
    score
  });
  
  return session;
};

export { db };
export default db;
