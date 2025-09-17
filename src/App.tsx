import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminPanel from './pages/AdminPanel';
import PracticePage from './pages/PracticePage';
import InterviewPage from './pages/InterviewPage';
import PostInterviewPage from './pages/PostInterviewPage';
import { initializeDatabase } from './database/helpers';
import './App.css';

// Initialize database on app start
initializeDatabase();

// Protected Route component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Router component
const AppRouter: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Landing/Login page */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          } 
        />

        {/* Candidate Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" replace /> : <CandidateDashboard />}
            </ProtectedRoute>
          }
        />

        {/* Practice Page */}
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" replace /> : <PracticePage />}
            </ProtectedRoute>
          }
        />

        {/* Interview Page */}
        <Route
          path="/interview/:interviewId"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" replace /> : <InterviewPage />}
            </ProtectedRoute>
          }
        />

        {/* Post Interview Summary Page */}
        <Route
          path="/interview/:interviewId/summary"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" replace /> : <PostInterviewPage />}
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
