import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveAPI, dashboardAPI } from '../utils/api';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Bell,
  LogOut,
  Eye,
  FileText,
  RefreshCw,
  Sparkles,
  PlusCircle,
  BarChart3,
  ClipboardList,
  Award,
  Zap
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh data every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [activeFilter, leaveRequests]);

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
      
      const [statsRes, leavesRes] = await Promise.all([
        dashboardAPI.getTeacherStats(),
        leaveAPI.getAllLeaves(),
      ]);

      setStats(statsRes.data);
      // Handle the API response structure: { count, leaveRequests }
      setLeaveRequests(leavesRes.data.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty array on error to prevent map error
      setLeaveRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterRequests = () => {
    if (activeFilter === 'all') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(req => req.status === activeFilter));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header with Gradient */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Teacher Dashboard
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-indigo-100 text-lg">Welcome back, <span className="font-semibold">{user?.name}</span>! 👋</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fetchDashboardData(false)}
                className={`relative p-3 bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105 ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
                disabled={refreshing}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              {/* Notification Button with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Bell className="w-5 h-5" />
                  {stats?.pendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce font-bold">
                      {stats.pendingRequests}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNotifications && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    ></div>

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-96 overflow-y-auto">
                        {leaveRequests.filter(req => req.status === 'pending').length === 0 ? (
                          // Empty State
                          <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 text-center">No notifications yet</p>
                          </div>
                        ) : (
                          // Notification Items
                          <div className="divide-y divide-gray-100">
                            {leaveRequests
                              .filter(req => req.status === 'pending')
                              .slice(0, 5)
                              .map((request) => (
                                <div 
                                  key={request._id}
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowNotifications(false);
                                  }}
                                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {request.student?.name}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Leave request from {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(request.createdAt).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Footer - View All */}
                      {leaveRequests.filter(req => req.status === 'pending').length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button 
                            onClick={() => {
                              setActiveFilter('pending');
                              setShowNotifications(false);
                            }}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                          >
                            View all {leaveRequests.filter(req => req.status === 'pending').length} notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={logout} 
                className="bg-white/90 hover:bg-white text-indigo-600 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid with Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-105 transform text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Total Requests</h3>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.totalRequests || 0}
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>This semester</span>
            </div>
          </div>

          {/* Pending Card - Clickable with Animation */}
          <div 
            onClick={() => navigate('/teacher/leave-requests')}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl cursor-pointer hover:scale-105 transform text-white group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-yellow-100 uppercase tracking-wide">Pending Review</h3>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2 group-hover:rotate-12 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.pendingRequests || 0}
            </div>
            <div className="flex items-center gap-2 text-yellow-100 text-sm font-medium group-hover:gap-3 transition-all">
              <Zap className="w-4 h-4" />
              <span>Click to review →</span>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-105 transform text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-green-100 uppercase tracking-wide">Approved</h3>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.approvedRequests || 0}
            </div>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <Award className="w-4 h-4" />
              <span>Successfully approved</span>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:scale-105 transform text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-red-100 uppercase tracking-wide">Rejected</h3>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.rejectedRequests || 0}
            </div>
            <div className="flex items-center gap-2 text-red-100 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Declined requests</span>
            </div>
          </div>
        </div>

        {/* Today's Attendance Stats - Enhanced */}
        {stats?.attendanceStats && stats.attendanceStats.total > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Today's Attendance Overview
              </h3>
              <div className="bg-white rounded-xl px-4 py-2 shadow-md">
                <span className="text-sm text-gray-600">Live Updates</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">Active</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              <div className="bg-white rounded-2xl shadow-xl p-5 border-2 border-gray-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-600">Total Marked</h4>
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.attendanceStats.total}
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-5 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-green-700">Present</h4>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-800">
                  {stats.attendanceStats.present}
                </div>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  {Math.round((stats.attendanceStats.present / stats.attendanceStats.total) * 100)}% attendance
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-xl p-5 border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-red-700">Absent</h4>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-800">
                  {stats.attendanceStats.absent}
                </div>
                <div className="mt-2 text-xs text-red-600 font-medium">
                  Needs attention
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl shadow-xl p-5 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-orange-700">Late</h4>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-800">
                  {stats.attendanceStats.late}
                </div>
                <div className="mt-2 text-xs text-orange-600 font-medium">
                  Arrived late
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl shadow-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-700">Excused</h4>
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-800">
                  {stats.attendanceStats.excused}
                </div>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  With permission
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons - Enhanced */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-2.5 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/teacher/mark-attendance')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 group-hover:rotate-12 transition-transform">
                <ClipboardList className="w-7 h-7" />
              </div>
              <span className="text-lg">Mark Attendance</span>
            </button>

            <button
              onClick={() => navigate('/teacher/attendance-sheet')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 group-hover:rotate-12 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <span className="text-lg">Attendance Sheet</span>
            </button>

            <button
              onClick={() => navigate('/teacher/leave-requests')}
              className="relative bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 group-hover:rotate-12 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-lg">Leave Requests</span>
              {stats?.pendingRequests > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                  {stats.pendingRequests}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'approved'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'rejected'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Leave Requests</h2>
            <Users className="w-6 h-6 text-gray-400" />
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No requests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {activeFilter === 'all' 
                  ? 'No leave requests yet' 
                  : `No ${activeFilter} requests`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Attendance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quiz</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Coding</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.student?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {request.student?.studentId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {request.reason?.substring(0, 30)}...
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-semibold ${
                          request.attendance >= 75 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {request.attendance || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {request.quizScore ? (
                          <span className={request.quizScore >= 60 ? 'text-green-600' : 'text-red-600'}>
                            {request.quizScore}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {request.codingScore ? (
                          <span className={request.codingScore >= 50 ? 'text-green-600' : 'text-red-600'}>
                            {request.codingScore}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(request.status)}>
                          <span className="inline-flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Average Approval Rate</h3>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">
              {stats?.approvalRate || 0}%
            </div>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Students</h3>
              <Users className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">
              {stats?.totalStudents || 0}
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Today's Requests</h3>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">
              {stats?.todayRequests || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal - Placeholder */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Leave Request</h2>
              <p className="text-gray-600 mb-4">Detailed review modal will be implemented...</p>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
