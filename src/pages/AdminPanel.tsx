import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  FileText, 
  LogOut, 
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  Plus,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import db, { type Candidate, type Interview } from '../database';
import { InterviewDetailsModal } from '../components';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [adminData, setAdminData] = useState(db.getAdminData());
  const { session, logout } = useAuth();

  useEffect(() => {
    // Load data from database
    const loadData = () => {
      setCandidates(db.getCandidates());
      setInterviews(db.getInterviews());
      setAdminData(db.getAdminData());
    };
    
    loadData();
    
    // Check if we need to sync data from updated JSON files
    const candidatesData = db.getCandidates();
    const interviewsData = db.getInterviews();
    
    // If we detect old mock data, force reload
    const hasOldMockData = candidatesData.some(c => 
      c.email === 'john.doe@example.com' || c.email === 'jane.smith@example.com'
    ) || interviewsData.some(i => 
      i.interviewerName !== 'AI Agent' && !i.interviewerName.includes('AI Agent')
    );
    
    if (hasOldMockData) {
      console.log('Detected old data in admin panel, forcing sync...');
      db.forceReloadFromJSON();
      loadData();
    }
  }, []);

  const refreshData = () => {
    db.forceReloadFromJSON();
    setCandidates(db.getCandidates());
    setInterviews(db.getInterviews());
    setAdminData(db.getAdminData());
    console.log('Data refreshed from JSON files');
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'interviews', name: 'Scheduled Interviews', icon: Calendar },
    { id: 'schedule', name: 'Schedule Interview', icon: Plus },
    { id: 'candidates', name: 'Candidates', icon: Users },
    { id: 'reports', name: 'Reports', icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab stats={adminData.stats} onRefresh={refreshData} />;
      case 'interviews':
        return <ScheduledInterviewsTab interviews={interviews} />;
      case 'schedule':
        return <ScheduleInterviewTab />;
      case 'candidates':
        return <CandidatesTab candidates={candidates} />;
      case 'reports':
        return <ReportsTab interviews={interviews} />;
      default:
        return <DashboardTab stats={adminData.stats} onRefresh={refreshData} />;
    }
  };

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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">AutoHire.ai Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">{session?.user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ stats: any; onRefresh: () => void }> = ({ stats, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averagePracticeScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Interview completed by mike.johnson@example.com</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">New interview scheduled for jane.smith@example.com</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">New candidate registered: sarah.wilson@example.com</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Scheduled Interviews Tab Component
const ScheduledInterviewsTab: React.FC<{ interviews: Interview[] }> = ({ interviews }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.interviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    const matchesType = typeFilter === 'all' || interview.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedInterviews = filteredInterviews.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'behavioral':
        return 'bg-orange-100 text-orange-800';
      case 'system_design':
        return 'bg-indigo-100 text-indigo-800';
      case 'cultural_fit':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (interviewId: string, newStatus: string) => {
    db.updateInterview(interviewId, { status: newStatus as any });
    // Refresh page to reflect changes
    window.location.reload();
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInterview(null);
  };

  const handleStartInterview = () => {
    if (selectedInterview) {
      navigate(`/interview/${selectedInterview.id}`);
      setIsModalOpen(false);
      setSelectedInterview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h2>
        <div className="text-sm text-gray-600">
          Total: {sortedInterviews.length} interviews
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates or interviewers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="system_design">System Design</option>
              <option value="cultural_fit">Cultural Fit</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedInterviews.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No interviews found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                sortedInterviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.scheduledDate);
                  const isUpcoming = new Date(interview.scheduledDate) > new Date();
                  
                  return (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{interview.candidateName}</div>
                          <div className="text-sm text-gray-500">{interview.candidateEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{interview.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{interview.interviewerName}</div>
                          <div className="text-sm text-gray-500">{interview.interviewerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{interview.duration} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(interview.type)}`}>
                          {interview.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {interview.format.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {interview.status === 'scheduled' && isUpcoming && (
                            <button
                              onClick={() => handleStatusChange(interview.id, 'completed')}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(interview)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900">Scheduled Today</div>
          <div className="text-2xl font-bold text-blue-900">
            {interviews.filter(i => {
              const today = new Date().toDateString();
              return new Date(i.scheduledDate).toDateString() === today && i.status === 'scheduled';
            }).length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-900">This Week</div>
          <div className="text-2xl font-bold text-yellow-900">
            {interviews.filter(i => {
              const now = new Date();
              const weekFromNow = new Date();
              weekFromNow.setDate(now.getDate() + 7);
              const interviewDate = new Date(i.scheduledDate);
              return interviewDate >= now && interviewDate <= weekFromNow && i.status === 'scheduled';
            }).length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-900">Completed</div>
          <div className="text-2xl font-bold text-green-900">
            {interviews.filter(i => i.status === 'completed').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-900">Total Scheduled</div>
          <div className="text-2xl font-bold text-purple-900">
            {interviews.filter(i => i.status === 'scheduled').length}
          </div>
        </div>
      </div>

      {/* Interview Details Modal */}
      <InterviewDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        interview={selectedInterview}
        onStartInterview={handleStartInterview}
        showStartButton={false}
      />
    </div>
  );
};

// Schedule Interview Tab Component
const ScheduleInterviewTab: React.FC = () => {
  const [formData, setFormData] = useState({
    candidateEmail: '',
    date: '',
    time: '',
    type: 'technical' as 'technical' | 'behavioral',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find candidate by email to get candidateId and candidateName
      const candidates = await db.getCandidates();
      const candidate = candidates.find(c => c.email === formData.candidateEmail);
      
      if (!candidate) {
        alert('Candidate not found. Please make sure the email is correct.');
        return;
      }

      const interviewData = {
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: formData.candidateEmail,
        position: candidate.position || 'Software Developer',
        interviewerName: 'HR Team',
        interviewerEmail: 'hr@company.com',
        scheduledDate: `${formData.date}T${formData.time}:00`,
        duration: 60,
        type: formData.type,
        format: 'video_call' as const,
        status: 'scheduled' as const,
        notes: formData.notes,
        reminders: {
          candidate: false,
          interviewer: false,
          reminderSent: false
        }
      };
      
      await db.addInterview(interviewData);
      
      // Reset form
      setFormData({
        candidateEmail: '',
        date: '',
        time: '',
        type: 'technical',
        notes: ''
      });
      
      alert('Interview scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Error scheduling interview. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Schedule New Interview</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Email
              </label>
              <input
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="candidate@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'technical' | 'behavioral' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the interview..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// Candidates Tab Component
const CandidatesTab: React.FC<{ candidates: Candidate[] }> = ({ candidates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    notes: ''
  });

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const candidateData = {
      ...newCandidate,
      skills: newCandidate.skills.split(',').map(skill => skill.trim()),
      status: 'active' as const,
      resume: 'uploaded_resume.pdf',
      appliedDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      practiceScores: {
        totalSessions: 0,
        averageScore: 0,
        completedProblems: 0,
        bestScore: 0
      }
    };

    db.addCandidate(candidateData);
    
    // Reset form
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      skills: '',
      notes: ''
    });
    setShowAddForm(false);
    
    // Refresh page to show new candidate
    window.location.reload();
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedCandidate(null);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Add Candidate Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Candidate</h3>
          <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={newCandidate.phone}
                onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <input
                type="text"
                value={newCandidate.experience}
                onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })}
                placeholder="e.g. 3 years"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                value={newCandidate.skills}
                onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                placeholder="e.g. React, TypeScript, Node.js"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={newCandidate.notes}
                onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the candidate..."
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Add Candidate
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Interview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    candidate.status === 'active' ? 'bg-green-100 text-green-800' :
                    candidate.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    candidate.status === 'hired' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {candidate.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {candidate.lastActivity ? new Date(candidate.lastActivity).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {candidate.practiceScores?.averageScore ? `${candidate.practiceScores.averageScore}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleViewProfile(candidate)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Profile Modal */}
      {showProfileModal && selectedCandidate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={closeProfileModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
              <div className="relative flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedCandidate.name}</h3>
                  <p className="text-blue-100 text-lg">{selectedCandidate.position}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCandidate.status === 'active' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                      selectedCandidate.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' :
                      selectedCandidate.status === 'hired' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' :
                      'bg-gray-500/20 text-gray-200 border border-gray-400/30'
                    }`}>
                      {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 p-2 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-8 space-y-8">
                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border">{selectedCandidate.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border">{selectedCandidate.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Experience Level</label>
                      <p className="text-gray-900 font-medium bg-white px-3 py-2 rounded-lg border">{selectedCandidate.experience}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Resume</label>
                      <a
                        href={selectedCandidate.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>

                {/* Skills Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-lg">{selectedCandidate.practiceScores.totalSessions}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">
                          {selectedCandidate.practiceScores.averageScore > 0 ? `${selectedCandidate.practiceScores.averageScore}%` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-lg">{selectedCandidate.practiceScores.completedProblems}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Problems Solved</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">
                          {selectedCandidate.practiceScores.bestScore > 0 ? `${selectedCandidate.practiceScores.bestScore}%` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Best Score</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    Timeline & Activity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Application Date</label>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                        <p className="text-gray-900 font-medium">
                          {new Date(selectedCandidate.appliedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Last Activity</label>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <p className="text-gray-900 font-medium">
                          {new Date(selectedCandidate.lastActivity).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Card */}
                {selectedCandidate.notes && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      Additional Notes
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <p className="text-gray-700 leading-relaxed">{selectedCandidate.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={closeProfileModal}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Close
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => {
                  // This could open an edit form or perform other actions
                  console.log('Schedule interview for:', selectedCandidate.name);
                }}
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reports Tab Component
const ReportsTab: React.FC<{ interviews: Interview[] }> = ({ interviews }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {interviews.filter(i => i.status === 'scheduled').length}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {interviews.filter(i => i.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Technical</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-20 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {interviews.filter(i => i.type === 'technical').length}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Behavioral</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {interviews.filter(i => i.type === 'behavioral').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Interviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {interview.candidateEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(interview.scheduledDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interview.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                      interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
