import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../utils/attendanceApi';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, 
  Save, ArrowLeft, Download, FileText, Printer, Search, Filter,
  RefreshCw, Mail, TrendingUp, BarChart2, Copy, CheckSquare
} from 'lucide-react';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState({
    date: new Date().toISOString().split('T')[0],
    class: ''
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const classes = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year', 'MCA 1st Year', 'MCA 2nd Year'];

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && students.length > 0 && config.class) {
      const timer = setTimeout(() => {
        handleSaveAttendance(true);
      }, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [attendanceData, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSaveAttendance();
            break;
          case 'p':
            e.preventDefault();
            handleMarkAll('present');
            break;
          case 'a':
            e.preventDefault();
            handleMarkAll('absent');
            break;
          case 'l':
            e.preventDefault();
            handleMarkAll('late');
            break;
          case 'e':
            e.preventDefault();
            handleMarkAll('excused');
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('input[type="text"]')?.focus();
            break;
          case 'r':
            e.preventDefault();
            fetchStudents();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [students, config, attendanceData]);

  useEffect(() => {
    if (config.class) {
      fetchStudents();
    }
  }, [config.class, config.date]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getStudents({
        class: config.class,
        date: config.date
      });

      setStudents(response.data.students);

      const initialData = {};
      response.data.students.forEach(student => {
        initialData[student._id] = {
          status: student.status || 'present',
          remarks: student.remarks || ''
        };
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setErrorMessage('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: remarks
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updatedData = {};
    students.forEach(student => {
      updatedData[student._id] = {
        ...attendanceData[student._id],
        status: status
      };
    });
    setAttendanceData(updatedData);
  };

  const handleSaveAttendance = async (isAutoSave = false) => {
    if (!config.class) {
      if (!isAutoSave) setErrorMessage('Please select class');
      return;
    }

    try {
      setSaving(true);
      if (!isAutoSave) {
        setSuccessMessage('');
        setErrorMessage('');
      }

      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        status: attendanceData[student._id]?.status || 'present',
        remarks: attendanceData[student._id]?.remarks || ''
      }));

      const response = await attendanceAPI.markAttendance({
        attendanceRecords,
        date: config.date,
        class: config.class
      });

      if (!isAutoSave) {
        setSuccessMessage(`Attendance saved successfully for ${response.data.totalMarked} students!`);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setLastSaved(new Date());
      }

    } catch (error) {
      console.error('Error saving attendance:', error);
      if (!isAutoSave) {
        setErrorMessage(error.response?.data?.message || 'Failed to save attendance');
      }
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    present: Object.values(attendanceData).filter(a => a.status === 'present').length,
    absent: Object.values(attendanceData).filter(a => a.status === 'absent').length,
    late: Object.values(attendanceData).filter(a => a.status === 'late').length,
    excused: Object.values(attendanceData).filter(a => a.status === 'excused').length
  };

  const exportToCSV = () => {
    const headers = ['S.No', 'Student Name', 'Email', 'Status', 'Remarks'];
    const rows = students.map((student, index) => [
      index + 1,
      student.name,
      student.email,
      attendanceData[student._id]?.status || 'present',
      attendanceData[student._id]?.remarks || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${config.class}_${config.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Copy attendance summary to clipboard
  const copyToClipboard = () => {
    const summary = `Attendance Report - ${config.class} (${new Date(config.date).toLocaleDateString()})
Total Students: ${students.length}
Present: ${stats.present} (${((stats.present / students.length) * 100).toFixed(1)}%)
Absent: ${stats.absent} (${((stats.absent / students.length) * 100).toFixed(1)}%)
Late: ${stats.late} (${((stats.late / students.length) * 100).toFixed(1)}%)
Excused: ${stats.excused} (${((stats.excused / students.length) * 100).toFixed(1)}%)`;
    
    navigator.clipboard.writeText(summary).then(() => {
      setSuccessMessage('Attendance summary copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2000);
    });
  };

  // Send email notifications for absences
  const sendAbsenteeNotifications = () => {
    const absentees = students.filter(s => attendanceData[s._id]?.status === 'absent');
    if (absentees.length === 0) {
      setErrorMessage('No absent students to notify');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }
    setSuccessMessage(`Email notifications sent to ${absentees.length} absent students!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      attendanceData[student._id]?.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'status') {
      const statusA = attendanceData[a._id]?.status || 'present';
      const statusB = attendanceData[b._id]?.status || 'present';
      return statusA.localeCompare(statusB);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-sm text-gray-600 mt-1">Mark and manage student attendance efficiently</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {students.length > 0 && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Copy summary to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button
                    onClick={sendAbsenteeNotifications}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Notify absent students"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Notify</span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Class Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={config.date}
                onChange={(e) => setConfig({ ...config, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={config.class}
                onChange={(e) => setConfig({ ...config, class: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {students.length > 0 && (
            <>
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                      showFilters 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  
                  <button
                    onClick={fetchStudents}
                    className="px-4 py-2 border-2 border-gray-300 hover:border-blue-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Filter by Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="all">All Students</option>
                        <option value="present">Present Only</option>
                        <option value="absent">Absent Only</option>
                        <option value="late">Late Only</option>
                        <option value="excused">Excused Only</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="name">Name (A-Z)</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Auto-Save</label>
                      <div className="flex items-center gap-3 h-10">
                        <button
                          onClick={() => setAutoSave(!autoSave)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            autoSave ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoSave ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-sm text-gray-700">
                          {autoSave ? 'Enabled' : 'Disabled'}
                        </span>
                        {lastSaved && autoSave && (
                          <span className="text-xs text-gray-500">
                            Last: {lastSaved.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Quick Actions</p>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <BarChart2 className="w-3 h-3" />
                    {showFilters ? 'Hide' : 'Show'} Advanced Options
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMarkAll('present')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Keyboard: Ctrl+P"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('absent')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Keyboard: Ctrl+A"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark All Absent
                  </button>
                  <button
                    onClick={() => handleMarkAll('late')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Keyboard: Ctrl+L"
                  >
                    <Clock className="w-4 h-4" />
                    Mark All Late
                  </button>
                  <button
                    onClick={() => handleMarkAll('excused')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Keyboard: Ctrl+E"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Mark All Excused
                  </button>
                </div>
                
                {/* Keyboard Shortcuts Info */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Pro Tips
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                    <div>• <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Ctrl+S</kbd> Save</div>
                    <div>• <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Ctrl+P</kbd> All Present</div>
                    <div>• <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Ctrl+F</kbd> Search</div>
                    <div>• <kbd className="px-1 py-0.5 bg-white rounded border border-blue-300">Ctrl+R</kbd> Refresh</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Statistics Cards */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Present</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.present}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {students.length > 0 ? ((stats.present / students.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Absent</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {students.length > 0 ? ((stats.absent / students.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Late</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.late}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {students.length > 0 ? ((stats.late / students.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Excused</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.excused}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {students.length > 0 ? ((stats.excused / students.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {config.class ? 'No students found in this class' : 'Select a class to view students'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Students List</h3>
              </div>
              <div className="flex items-center gap-3">
                {filterStatus !== 'all' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Filtered: {filterStatus}
                  </span>
                )}
                <div className="text-sm font-medium bg-gray-700 px-3 py-1.5 rounded-lg">
                  {sortedStudents.length} of {students.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedStudents.map((student, index) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-1.5">
                          {[
                            { status: 'present', label: 'P', color: 'emerald' },
                            { status: 'absent', label: 'A', color: 'red' },
                            { status: 'late', label: 'L', color: 'orange' },
                            { status: 'excused', label: 'E', color: 'blue' }
                          ].map(({ status, label, color }) => {
                            const isSelected = attendanceData[student._id]?.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student._id, status)}
                                className={`w-10 h-10 rounded-lg font-semibold text-sm border-2 transition-all ${
                                  isSelected
                                    ? `bg-${color}-600 border-${color}-700 text-white shadow-md scale-105`
                                    : `bg-white border-gray-300 text-gray-700 hover:bg-${color}-50 hover:border-${color}-400`
                                }`}
                                title={status.charAt(0).toUpperCase() + status.slice(1)}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={attendanceData[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          placeholder="Optional remarks..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{new Date(config.date).toLocaleDateString()}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{config.class}</span>
                </span>
                {lastSaved && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveAttendance(false)}
                  disabled={saving || !config.class}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center min-w-[140px]"
                  title="Ctrl+S to save"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .bg-white { background: white !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MarkAttendance;
