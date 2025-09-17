export interface User {
  email: string;
}

export interface Session {
  sessionId: string;
  user: User;
  isLoggedIn: boolean;
  loginTime: number;
  expiryTime: number;
  role: 'admin' | 'candidate';
}

export interface AuthContextType {
  session: Session | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'completed';
  lastInterview?: string;
  score?: number;
}

export interface Interview {
  id: string;
  candidateEmail: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'technical' | 'behavioral';
}

export interface DashboardMetrics {
  totalCandidates: number;
  scheduledInterviews: number;
  completedInterviews: number;
  averageScore: number;
}

export interface InterviewPerformanceStats {
  overallScore: number;
  technicalScore: number;
  behavioralScore: number;
  codingScore: number;
  systemDesignScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeSpent: number; // in minutes
  averageResponseTime: number; // in seconds
}

export interface InterviewFeedback {
  strengths: string[];
  areasForImprovement: string[];
  specificNotes: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire';
  nextRound?: string;
}

export interface PostInterviewData {
  interviewId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  interviewer: string;
  date: string;
  duration: number; // in minutes
  performance: InterviewPerformanceStats;
  feedback: InterviewFeedback;
  nextSteps: {
    timeline: string;
    contact: string;
    additionalInfo?: string;
  };
}
