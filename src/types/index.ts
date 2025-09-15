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
