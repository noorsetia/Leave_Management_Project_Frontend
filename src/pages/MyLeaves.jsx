import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { leaveAPI } from '../utils/api';

const MyLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaveRequests || []);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
      setLeaves([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leaveAPI.getLeaveStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    try {
      // Optimistically remove from UI
      const deletedLeave = leaves.find(leave => leave._id === leaveId);
      setLeaves(leaves.filter(leave => leave._id !== leaveId));
      
      // Update stats optimistically
      if (stats && deletedLeave) {
        setStats({
          ...stats,
          total: stats.total - 1,
          [deletedLeave.status]: stats[deletedLeave.status] - 1
        });
      }

      // Delete from server
      await leaveAPI.deleteLeaveRequest(leaveId);
      
      // Refresh data to ensure sync
      await Promise.all([fetchLeaves(), fetchStats()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete leave request');
      // Refresh data on error to restore correct state
      await Promise.all([fetchLeaves(), fetchStats()]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredLeaves = filter === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          </div>
          <button
            onClick={() => navigate('/student/apply-leave')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Apply for Leave
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-yellow-700 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-green-700 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <p className="text-red-700 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({leaves.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                filter === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({leaves.filter(l => l.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                filter === 'approved'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approved ({leaves.filter(l => l.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                filter === 'rejected'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected ({leaves.filter(l => l.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No leave requests found</p>
              <button
                onClick={() => navigate('/student/apply-leave')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Apply for your first leave
              </button>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div key={leave._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{leave.leaveType}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(leave.status)} flex items-center gap-1`}>
                        {getStatusIcon(leave.status)}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{leave.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}</span>
                      </div>
                    </div>
                  </div>
                  {leave.status === 'pending' && (
                    <button
                      onClick={() => handleDelete(leave._id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete request"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {leave.teacherRemarks && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Teacher's Remarks:</p>
                    <p className="text-sm text-gray-600">{leave.teacherRemarks}</p>
                    {leave.reviewedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed by {leave.reviewedBy.name} on {formatDate(leave.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  Applied on {formatDate(leave.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLeaves;
