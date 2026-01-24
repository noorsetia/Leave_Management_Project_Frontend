import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveAPI, attendanceAPI, dashboardAPI, quizAPI } from '../utils/api';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  BookOpen,
  BarChart3,
  LogOut,
  FileText,
  RefreshCw,
  Award,
  Brain,
  Workflow
} from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [leaveStats, setLeaveStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh data every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Refresh data when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Fetch leave stats and recent leaves
      const [statsRes, leavesRes] = await Promise.all([
        leaveAPI.getLeaveStats().catch(() => ({ data: { stats: { total: 0, pending: 0, approved: 0, rejected: 0 } } })),
        leaveAPI.getMyLeaves().catch(() => ({ data: { leaveRequests: [] } })),
      ]);

      setLeaveStats(statsRes.data.stats);
      setRecentLeaves(leavesRes.data.leaveRequests.slice(0, 5)); // Get latest 5 leaves

      // Try to fetch attendance (may not exist yet)
      try {
        const attendanceRes = await attendanceAPI.getMyAttendance();
        setAttendance(attendanceRes.data);
      } catch (error) {
        // Set default attendance if not found
        setAttendance({ attendancePercentage: 0, totalClasses: 0, attendedClasses: 0, isEligible: false });
      }

      // Fetch quiz statistics
      try {
        const quizAttemptsRes = await quizAPI.getMyAttempts();
        const attempts = quizAttemptsRes.data.attempts || [];
        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter(a => a.passed).length;
        const avgScore = totalAttempts > 0 
          ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(1)
          : 0;
        
        setQuizStats({
          totalAttempts,
          passedAttempts,
          avgScore
        });
      } catch (error) {
        setQuizStats({ totalAttempts: 0, passedAttempts: 0, avgScore: 0 });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
      approved: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
      rejected: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800',
      'in-progress': 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800',
    };
    return badges[status] || 'inline-block px-3 py-1 rounded-full text-sm font-semibold';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      'in-progress': <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fetchDashboardData(false)}
                className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
                disabled={refreshing}
              >
                <RefreshCw className="w-6 h-6" />
              </button>
              <button onClick={logout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Attendance</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {attendance?.attendancePercentage || 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Current percentage</p>
              </div>
              <div className={`text-sm font-semibold ${
                (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(attendance?.attendancePercentage || 0) >= 75 ? 'Eligible' : 'Not Eligible'}
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  (attendance?.attendancePercentage || 0) >= 75 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${attendance?.attendancePercentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Quiz Score</h3>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {quizStats?.avgScore || 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Average score</p>
              </div>
              <div className="text-sm font-semibold text-purple-600">
                {quizStats?.passedAttempts || 0}/{quizStats?.totalAttempts || 0}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {quizStats?.totalAttempts || 0} quiz{(quizStats?.totalAttempts || 0) !== 1 ? 'zes' : ''} attempted
            </p>
          </div>

          {/* Total Leaves Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Leaves</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {leaveStats?.total || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
            <p className="text-xs text-gray-600 mt-2">
              {leaveStats?.totalDaysApproved || 0} days approved
            </p>
          </div>

          {/* Approved Leaves Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {leaveStats?.approved || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Successful requests</p>
          </div>

          {/* Pending Leaves Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {leaveStats?.pending || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Under review</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          {/* Main Workflow Button - Prominent */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/student/workflow')}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center border-2 border-white"
            >
              <Workflow className="w-7 h-7 mr-3" />
              <div className="text-left">
                <div className="text-xl">Complete Student Workflow</div>
                <div className="text-sm font-normal text-blue-100">Attendance → Quiz → Coding → Leave Application</div>
              </div>
            </button>
          </div>

          {/* Progress Tracker Button - New */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/student/progress')}
              className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center border-2 border-white"
            >
              <TrendingUp className="w-7 h-7 mr-3" />
              <div className="text-left">
                <div className="text-xl">Academic Progress Dashboard</div>
                <div className="text-sm font-normal text-green-100">Track Performance, Goals & Achievements</div>
              </div>
            </button>
          </div>

          {/* Other Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/student/apply-leave')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Apply for Leave
            </button>
            <button 
              onClick={() => navigate('/student/my-leaves')}
              className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              View My Leaves
            </button>
            <button 
              onClick={() => navigate('/student/quizzes')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Brain className="w-5 h-5 mr-2" />
              Take Quiz
            </button>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Leave Requests</h2>
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>

          {recentLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No leave requests yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Apply for Leave" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Leave Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Days</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {leave.leaveType}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(leave.status)}>
                          <span className="inline-flex items-center gap-1">
                            {getStatusIcon(leave.status)}
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {recentLeaves.length >= 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/student/my-leaves')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View all leave requests →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Maintain at least 75% attendance to be eligible for leave</li>
                <li>• Leave requests are reviewed by teachers</li>
                <li>• You can track your leave status in the "My Leaves" section</li>
                <li>• Provide detailed reasons for better approval chances</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
