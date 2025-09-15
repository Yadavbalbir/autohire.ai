// Database utility functions for JSON-based local storage
import candidatesData from './candidates.json';
import interviewsData from './interviews.json';
import practiceSessionsData from './practice_sessions.json';
import problemsData from './problems.json';
import adminData from './admin_data.json';

// Database interface
export interface Database {
  candidates: Candidate[];
  interviews: Interview[];
  practiceSessions: PracticeSession[];
  problems: Problem[];
  adminData: AdminData;
}

// Type definitions
export interface Candidate {
  id: string;
  email: string;
  name: string;
  phone: string;
  position: string;
  experience: string;
  skills: string[];
  resume: string;
  status: 'active' | 'inactive' | 'hired' | 'rejected';
  appliedDate: string;
  lastActivity: string;
  practiceScores: {
    totalSessions: number;
    averageScore: number;
    completedProblems: number;
    bestScore: number;
  };
  notes: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  interviewerName: string;
  interviewerEmail: string;
  scheduledDate: string;
  duration: number;
  type: 'technical' | 'behavioral' | 'system_design' | 'cultural_fit';
  format: 'video_call' | 'phone_call' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  reminders: {
    candidate: boolean;
    interviewer: boolean;
    reminderSent: boolean;
  };
}

export interface PracticeSession {
  id: string;
  candidateId: string;
  candidateEmail: string;
  problemId: string;
  problemTitle: string;
  startedAt: string;
  completedAt: string | null;
  timeSpent: number;
  score: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  attempts: number;
  solution: string;
  notes: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  template: string;
  testCases: Array<{
    input: any;
    expected: any;
  }>;
}

export interface AdminData {
  stats: {
    totalCandidates: number;
    activeInterviews: number;
    completedInterviews: number;
    totalPracticeSessions: number;
    averagePracticeScore: number;
    lastUpdated: string;
  };
  settings: {
    companyName: string;
    emailNotifications: boolean;
    reminderSettings: {
      candidateReminder: number;
      interviewerReminder: number;
    };
    interviewTypes: string[];
    interviewFormats: string[];
    defaultInterviewDuration: number;
  };
  interviewers: Array<{
    id: string;
    name: string;
    email: string;
    specializations: string[];
    availability: string;
  }>;
}

// Local storage keys
const STORAGE_KEYS = {
  CANDIDATES: 'autohire_candidates',
  INTERVIEWS: 'autohire_interviews', 
  PRACTICE_SESSIONS: 'autohire_practice_sessions',
  PROBLEMS: 'autohire_problems',
  ADMIN_DATA: 'autohire_admin_data',
};

// Database class
class LocalDatabase {
  private data: Database;

  constructor() {
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): Database {
    // Load data from localStorage or use default data
    const candidates = this.loadFromStorage(STORAGE_KEYS.CANDIDATES, candidatesData) as Candidate[];
    const interviews = this.loadFromStorage(STORAGE_KEYS.INTERVIEWS, interviewsData) as Interview[];
    const practiceSessions = this.loadFromStorage(STORAGE_KEYS.PRACTICE_SESSIONS, practiceSessionsData) as PracticeSession[];
    const problems = this.loadFromStorage(STORAGE_KEYS.PROBLEMS, problemsData) as Problem[];
    const adminDataLoaded = this.loadFromStorage(STORAGE_KEYS.ADMIN_DATA, adminData) as AdminData;

    return {
      candidates,
      interviews,
      practiceSessions,
      problems,
      adminData: adminDataLoaded,
    };
  }

  private loadFromStorage<T>(key: string, defaultData: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultData;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  // Candidates operations
  getCandidates(): Candidate[] {
    return this.data.candidates;
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.data.candidates.find(candidate => candidate.id === id);
  }

  getCandidateByEmail(email: string): Candidate | undefined {
    return this.data.candidates.find(candidate => candidate.email === email);
  }

  addCandidate(candidate: Omit<Candidate, 'id'>): Candidate {
    const id = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCandidate: Candidate = { ...candidate, id };
    this.data.candidates.push(newCandidate);
    this.saveToStorage(STORAGE_KEYS.CANDIDATES, this.data.candidates);
    this.updateStats();
    return newCandidate;
  }

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const index = this.data.candidates.findIndex(candidate => candidate.id === id);
    if (index === -1) return null;

    this.data.candidates[index] = { ...this.data.candidates[index], ...updates };
    this.saveToStorage(STORAGE_KEYS.CANDIDATES, this.data.candidates);
    return this.data.candidates[index];
  }

  deleteCandidate(id: string): boolean {
    const index = this.data.candidates.findIndex(candidate => candidate.id === id);
    if (index === -1) return false;

    this.data.candidates.splice(index, 1);
    this.saveToStorage(STORAGE_KEYS.CANDIDATES, this.data.candidates);
    this.updateStats();
    return true;
  }

  // Interviews operations
  getInterviews(): Interview[] {
    return this.data.interviews;
  }

  getInterviewById(id: string): Interview | undefined {
    return this.data.interviews.find(interview => interview.id === id);
  }

  getInterviewsByCandidateId(candidateId: string): Interview[] {
    return this.data.interviews.filter(interview => interview.candidateId === candidateId);
  }

  addInterview(interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Interview {
    const id = `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const newInterview: Interview = { 
      ...interview, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.data.interviews.push(newInterview);
    this.saveToStorage(STORAGE_KEYS.INTERVIEWS, this.data.interviews);
    this.updateStats();
    return newInterview;
  }

  updateInterview(id: string, updates: Partial<Interview>): Interview | null {
    const index = this.data.interviews.findIndex(interview => interview.id === id);
    if (index === -1) return null;

    this.data.interviews[index] = { 
      ...this.data.interviews[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveToStorage(STORAGE_KEYS.INTERVIEWS, this.data.interviews);
    return this.data.interviews[index];
  }

  deleteInterview(id: string): boolean {
    const index = this.data.interviews.findIndex(interview => interview.id === id);
    if (index === -1) return false;

    this.data.interviews.splice(index, 1);
    this.saveToStorage(STORAGE_KEYS.INTERVIEWS, this.data.interviews);
    this.updateStats();
    return true;
  }

  // Practice sessions operations
  getPracticeSessions(): PracticeSession[] {
    return this.data.practiceSessions;
  }

  getPracticeSessionsByCandidateId(candidateId: string): PracticeSession[] {
    return this.data.practiceSessions.filter(session => session.candidateId === candidateId);
  }

  addPracticeSession(session: Omit<PracticeSession, 'id'>): PracticeSession {
    const id = `practice_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newSession: PracticeSession = { ...session, id };
    this.data.practiceSessions.push(newSession);
    this.saveToStorage(STORAGE_KEYS.PRACTICE_SESSIONS, this.data.practiceSessions);
    this.updateCandidatePracticeScores(session.candidateId);
    return newSession;
  }

  updatePracticeSession(id: string, updates: Partial<PracticeSession>): PracticeSession | null {
    const index = this.data.practiceSessions.findIndex(session => session.id === id);
    if (index === -1) return null;

    this.data.practiceSessions[index] = { ...this.data.practiceSessions[index], ...updates };
    this.saveToStorage(STORAGE_KEYS.PRACTICE_SESSIONS, this.data.practiceSessions);
    this.updateCandidatePracticeScores(this.data.practiceSessions[index].candidateId);
    return this.data.practiceSessions[index];
  }

  // Problems operations
  getProblems(): Problem[] {
    return this.data.problems;
  }

  getProblemById(id: string): Problem | undefined {
    return this.data.problems.find(problem => problem.id === id);
  }

  // Admin data operations
  getAdminData(): AdminData {
    return this.data.adminData;
  }

  updateAdminData(updates: Partial<AdminData>): AdminData {
    this.data.adminData = { ...this.data.adminData, ...updates };
    this.saveToStorage(STORAGE_KEYS.ADMIN_DATA, this.data.adminData);
    return this.data.adminData;
  }

  // Helper methods
  private updateCandidatePracticeScores(candidateId: string): void {
    const sessions = this.getPracticeSessionsByCandidateId(candidateId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const practiceScores = {
      totalSessions: sessions.length,
      averageScore: completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length) 
        : 0,
      completedProblems: completedSessions.length,
      bestScore: completedSessions.length > 0 
        ? Math.max(...completedSessions.map(s => s.score)) 
        : 0,
    };

    this.updateCandidate(candidateId, { practiceScores });
  }

  private updateStats(): void {
    const stats = {
      totalCandidates: this.data.candidates.length,
      activeInterviews: this.data.interviews.filter(i => i.status === 'scheduled').length,
      completedInterviews: this.data.interviews.filter(i => i.status === 'completed').length,
      totalPracticeSessions: this.data.practiceSessions.length,
      averagePracticeScore: this.calculateAveragePracticeScore(),
      lastUpdated: new Date().toISOString(),
    };

    this.data.adminData.stats = stats;
    this.saveToStorage(STORAGE_KEYS.ADMIN_DATA, this.data.adminData);
  }

  private calculateAveragePracticeScore(): number {
    const completedSessions = this.data.practiceSessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return 0;
    
    const totalScore = completedSessions.reduce((sum, session) => sum + session.score, 0);
    return Math.round(totalScore / completedSessions.length);
  }

  // Search and filter operations
  searchCandidates(query: string): Candidate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(lowercaseQuery) ||
      candidate.email.toLowerCase().includes(lowercaseQuery) ||
      candidate.position.toLowerCase().includes(lowercaseQuery) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
    );
  }

  getUpcomingInterviews(days: number = 7): Interview[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.data.interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate);
      return interview.status === 'scheduled' && 
             interviewDate >= now && 
             interviewDate <= futureDate;
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }
}

// Create singleton instance
export const db = new LocalDatabase();

// Export for use in components
export default db;
