import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, Session } from '../types';
import { createSession, loadSession, removeSession, saveSession } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Load existing session on app startup
    const existingSession = loadSession();
    if (existingSession) {
      setSession(existingSession);
    }
  }, []);

  const login = (email: string) => {
    const newSession = createSession(email);
    setSession(newSession);
    saveSession(newSession);
  };

  const logout = () => {
    setSession(null);
    removeSession();
  };

  const isAuthenticated = session?.isLoggedIn ?? false;
  const isAdmin = session?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
