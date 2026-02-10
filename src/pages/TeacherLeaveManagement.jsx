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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leave Requests</h1>
              <p className="text-slate-500">Review, approve, and track student leave submissions.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLeaves(false)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
                disabled={refreshing}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total Requests</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total || 0}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-500">Pending</p>
            <p className="text-2xl font-bold text-amber-700">{stats.pending || 0}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-500">Approved</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.approved || 0}</p>
          </div>
          <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-rose-500">Rejected</p>
            <p className="text-2xl font-bold text-rose-700">{stats.rejected || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List / Empty State */}
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-semibold">No leave requests found</p>
              <p className="text-slate-400 text-sm mt-1">
                {filter !== 'all' ? `No ${filter} requests available.` : 'There are no requests to review.'}
              </p>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div key={leave._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {leave.student?.name || 'Unknown Student'}
                          </h3>
                          <span className={`${getStatusBadge(leave.status)} inline-flex items-center gap-1`}>
                            {getStatusIcon(leave.status)}
                            {leave.status ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1) : 'Unknown'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{leave.student?.email || 'Not available'}</p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{leave.leaveType || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{leave.numberOfDays || 0} {leave.numberOfDays === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>

                        <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">Reason:</span>{' '}
                          {leave.description || 'Not provided.'}
                        </div>

                        {leave.attendancePercentage !== undefined && (
                          <div className="mt-3 text-sm">
                            <span className="text-slate-600 font-medium">Attendance:</span>{' '}
                            <span className={leave.attendancePercentage >= 75 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                              {leave.attendancePercentage}%
                            </span>
                          </div>
                        )}

                        {leave.teacherRemarks && (
                          <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-700">Your Remarks</p>
                            <p className="mt-1">{leave.teacherRemarks}</p>
                            {leave.reviewedAt && (
                              <p className="text-xs text-slate-400 mt-1">Reviewed on {formatDate(leave.reviewedAt)}</p>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-slate-400 mt-3">Applied on {formatDate(leave.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex flex-col gap-3 w-full lg:w-44">
                      <button
                        onClick={() => handleApprove(leave._id)}
                        disabled={processingId === leave._id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-semibold py-2.5 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/leave/${leave._id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleReject(leave._id)}
                        disabled={processingId === leave._id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

        {stats.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-amber-900 font-semibold">
                You have {stats.pending} pending leave {stats.pending === 1 ? 'request' : 'requests'} awaiting review.
              </p>
              <p className="text-amber-800 text-sm mt-1">
                Please review and respond promptly to keep students informed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherLeaveManagement;
