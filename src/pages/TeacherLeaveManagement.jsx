import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../utils/api';
import { 
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  LogOut,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const TeacherLeaveManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaves();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchLeaves(true); // Silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, filter, searchTerm]);

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchLeaves(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchLeaves = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await leaveAPI.getAllLeaves();
      const allLeaves = response.data.leaveRequests || [];
      setLeaves(allLeaves);

      // Calculate stats
      const newStats = {
        total: allLeaves.length,
        pending: allLeaves.filter(l => l.status === 'pending').length,
        approved: allLeaves.filter(l => l.status === 'approved').length,
        rejected: allLeaves.filter(l => l.status === 'rejected').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      // Set empty array on error to prevent crashes
      setLeaves([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterLeaves = () => {
    let filtered = leaves;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(leave => leave.status === filter);
    }

    // Search by student name
    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(filtered);
  };

  const handleApprove = async (leaveId) => {
    const remarks = prompt('Enter approval remarks (optional):');
    
    setProcessingId(leaveId);
    try {
      // Optimistically update UI
      const updatedLeaves = leaves.map(leave =>
        leave._id === leaveId
          ? { ...leave, status: 'approved', reviewedBy: user, teacherRemarks: remarks }
          : leave
      );
      setLeaves(updatedLeaves);
      
      // Update stats optimistically
      setStats({
        ...stats,
        pending: stats.pending - 1,
        approved: stats.approved + 1
      });

      // Send to server
      await leaveAPI.updateLeaveStatus(leaveId, {
        status: 'approved',
        teacherRemarks: remarks || 'Approved'
      });
      
      // Refresh data to ensure sync
      await fetchLeaves();
      
      alert('Leave request approved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve leave request');
      // Refresh on error to restore correct state
      await fetchLeaves();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leaveId) => {
    const remarks = prompt('Enter rejection reason (required):');
    
    if (!remarks || remarks.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessingId(leaveId);
    try {
      // Optimistically update UI
      const updatedLeaves = leaves.map(leave =>
        leave._id === leaveId
          ? { ...leave, status: 'rejected', reviewedBy: user, teacherRemarks: remarks }
          : leave
      );
      setLeaves(updatedLeaves);
      
      // Update stats optimistically
      setStats({
        ...stats,
        pending: stats.pending - 1,
        rejected: stats.rejected + 1
      });

      // Send to server
      await leaveAPI.updateLeaveStatus(leaveId, {
        status: 'rejected',
        teacherRemarks: remarks
      });
      
      // Refresh data to ensure sync
      await fetchLeaves();
      
      alert('Leave request rejected');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject leave request');
      // Refresh on error to restore correct state
      await fetchLeaves();
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return `px-3 py-1 rounded-full text-sm font-semibold border ${badges[status]}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leave requests...</p>
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
              <button
                onClick={() => fetchLeaves(false)}
                className={`p-2 text-gray-600 hover:text-gray-900 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
                disabled={refreshing}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Notification Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Leave Requests</h2>
            {stats.pending > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {stats.pending} New
              </span>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('pending')}>
            <p className="text-yellow-700 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Pending Review
            </p>
            <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('approved')}>
            <p className="text-green-700 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('rejected')}>
            <p className="text-red-700 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No leave requests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter !== 'all' ? `No ${filter} requests` : 'No requests available'}
              </p>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave._id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${
                  leave.status === 'pending' ? 'border-l-4 border-yellow-500' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Section - Student & Leave Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {leave.student?.name || 'Unknown Student'}
                          </h3>
                          <span className={`${getStatusBadge(leave.status)} flex items-center gap-1`}>
                            {getStatusIcon(leave.status)}
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{leave.student?.email}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Leave Type:</span>
                            <span className="text-gray-900 font-semibold">{leave.leaveType}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="text-gray-900">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">Days Requested:</span>
                            <span className="text-gray-900 font-semibold text-lg">
                              {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                          <p className="text-sm text-gray-900">{leave.description}</p>
                        </div>

                        {leave.attendancePercentage !== undefined && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Attendance:</span>
                            <span className={`font-semibold ${
                              leave.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {leave.attendancePercentage}%
                            </span>
                          </div>
                        )}

                        {leave.teacherRemarks && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">Your Remarks:</p>
                            <p className="text-sm text-gray-600">{leave.teacherRemarks}</p>
                            {leave.reviewedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Reviewed on {formatDate(leave.reviewedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-400">
                          Applied on {formatDate(leave.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  {leave.status === 'pending' && (
                    <div className="flex flex-col gap-3 md:w-40">
                      <button
                        onClick={() => handleApprove(leave._id)}
                        disabled={processingId === leave._id}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave._id)}
                        disabled={processingId === leave._id}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Alert */}
        {stats.pending > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-900 font-medium">
                You have {stats.pending} pending leave {stats.pending === 1 ? 'request' : 'requests'} waiting for your review
              </p>
              <p className="text-yellow-800 text-sm mt-1">
                Please review and respond to student leave applications promptly
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherLeaveManagement;
