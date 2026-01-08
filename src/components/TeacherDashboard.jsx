import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [activeFilter, leaveRequests]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, leavesRes] = await Promise.all([
        dashboardAPI.getTeacherStats(),
        leaveAPI.getAllLeaveRequests(),
      ]);

      setStats(statsRes.data);
      setLeaveRequests(leavesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {stats?.pendingRequests > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingRequests}
                  </span>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.totalRequests || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">This semester</p>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.pendingRequests || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting your review</p>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats?.approvedRequests || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Successfully approved</p>
          </div>

          {/* Rejected Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {stats?.rejectedRequests || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Declined requests</p>
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Average Approval Rate</h3>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">
              {stats?.approvalRate || 0}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Students</h3>
              <Users className="w-6 h-6" />
            </div>
            <div className="text-4xl font-bold">
              {stats?.totalStudents || 0}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
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
