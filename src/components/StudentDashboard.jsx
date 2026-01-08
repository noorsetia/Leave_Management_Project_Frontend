import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI, attendanceAPI, dashboardAPI } from '../utils/api';
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
  LogOut
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, attendanceRes, leavesRes] = await Promise.all([
        dashboardAPI.getStudentStats(),
        attendanceAPI.getMyAttendance(),
        leaveAPI.getMyLeaveRequests(),
      ]);

      setStats(statsRes.data);
      setAttendance(attendanceRes.data);
      setLeaveRequests(leavesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
            <button onClick={logout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Attendance</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {attendance?.percentage || 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Current percentage</p>
              </div>
              <div className={`text-sm font-semibold ${
                (attendance?.percentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(attendance?.percentage || 0) >= 75 ? 'Eligible' : 'Not Eligible'}
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  (attendance?.percentage || 0) >= 75 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${attendance?.percentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Total Leaves Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Leaves</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.totalLeaves || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">This semester</p>
          </div>

          {/* Approved Leaves Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats?.approvedLeaves || 0}
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
              {stats?.pendingLeaves || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Under review</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button 
            onClick={() => setShowLeaveForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Request New Leave
          </button>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Leave Requests</h2>
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>

          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No leave requests yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Request New Leave" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quiz Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Coding Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((leave) => (
                    <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {leave.reason?.substring(0, 50)}...
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(leave.status)}>
                          <span className="inline-flex items-center gap-1">
                            {getStatusIcon(leave.status)}
                            {leave.status}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {leave.quizScore ? `${leave.quizScore}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {leave.codingScore ? `${leave.codingScore}%` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Maintain at least 75% attendance to be eligible for leave</li>
                <li>• You must pass both Quiz (60%) and Coding Test (50%) to proceed</li>
                <li>• Teacher approval is required after passing all tests</li>
                <li>• Check your pending leave requests regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Form Modal - Placeholder */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Leave</h2>
              <p className="text-gray-600 mb-4">Leave request form will be implemented in the next component...</p>
              <button 
                onClick={() => setShowLeaveForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200"
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

export default StudentDashboard;
