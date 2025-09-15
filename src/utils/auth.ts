import type { Session, User } from '../types';

const SESSION_KEY = 'autohire_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ADMIN_EMAIL = 'hr@microsoft.com';

export const generateSessionId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const isAdminEmail = (email: string): boolean => {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const createSession = (email: string): Session => {
  const now = Date.now();
  const user: User = { email };
  
  return {
    sessionId: generateSessionId(),
    user,
    isLoggedIn: true,
    loginTime: now,
    expiryTime: now + SESSION_DURATION,
    role: isAdminEmail(email) ? 'admin' : 'candidate'
  };
};

export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = (): Session | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session: Session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expiryTime) {
      removeSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error loading session:', error);
    removeSession();
    return null;
  }
};

export const removeSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
