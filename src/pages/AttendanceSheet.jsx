import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../utils/attendanceApi';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Save,
  Download,
  RefreshCw,
  ArrowLeft,
  Filter,
  Search,
  UserPlus,
  Trash2
} from 'lucide-react';

const AttendanceSheet = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });

  // Available classes - matching MarkAttendance page
  const classes = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year', 'MCA 1st Year', 'MCA 2nd Year'];

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (selectedClass) {
      const interval = setInterval(() => {
        loadStudents(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedClass, selectedDate]);

  // Auto-save when data changes
  useEffect(() => {
    if (autoSaveEnabled && Object.keys(attendanceData).length > 0) {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [attendanceData, autoSaveEnabled]);

  const loadStudents = async (silent = false) => {
    if (!selectedClass) return;

    try {
      if (!silent) setLoading(true);
      
      const response = await attendanceAPI.getStudentsForAttendance({
        date: selectedDate,
        class: selectedClass
      });

      const studentsList = response.data.students || [];

      setStudents(studentsList);
      
      // Initialize attendance data from existing records
      const initialData = {};
      studentsList.forEach(student => {
        if (student.attendance) {
          initialData[student._id] = {
            status: student.attendance.status,
            remarks: student.attendance.remarks || ''
          };
        } else {
          initialData[student._id] = {
            status: 'present',
            remarks: ''
          };
        }
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error loading students:', error);
      showMessage('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      showMessage('error', 'Please enter both name and email');
      return;
    }

    if (!selectedClass) {
      showMessage('error', 'Please select a class first');
      return;
    }

    try {
      setLoading(true);

      const response = await attendanceAPI.addCustomStudent({
        name: newStudent.name.trim(),
        email: newStudent.email.trim(),
        class: selectedClass
      });

      // Reload students to include the new one
      await loadStudents(true);

      // Reset form and close modal
      setNewStudent({ name: '', email: '' });
      setShowAddStudentModal(false);
      showMessage('success', `${response.data.student.name} added successfully!`);
    } catch (error) {
      console.error('Error adding student:', error);
      showMessage('error', error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    if (!student?.isCustomAdded) {
      showMessage('error', 'Cannot remove enrolled students. Only custom-added students can be removed.');
      return;
    }

    if (!window.confirm(`Remove ${student.name} from the list?`)) {
      return;
    }

    try {
      setLoading(true);

      await attendanceAPI.removeCustomStudent(studentId);

      // Reload students list
      await loadStudents(true);

      showMessage('success', `${student.name} removed successfully!`);
    } catch (error) {
      console.error('Error removing student:', error);
      showMessage('error', error.response?.data?.message || 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSave = async (isAutoSave = false) => {
    try {
      setSaving(true);
      
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
        student: studentId,
        status: data.status,
        remarks: data.remarks,
        date: selectedDate,
        class: selectedClass
      }));

      await attendanceAPI.markAttendance({ attendanceRecords });
      
      setLastSaved(new Date());
      if (!isAutoSave) {
        showMessage('success', 'Attendance saved successfully!');
      }
      
      // Refresh to get updated data
      loadStudents(true);
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (!isAutoSave) {
        showMessage('error', error.response?.data?.message || 'Failed to save attendance');
      }
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const updatedData = {};
    students.forEach(student => {
      updatedData[student._id] = {
        status: 'present',
        remarks: attendanceData[student._id]?.remarks || ''
      };
    });
    setAttendanceData(updatedData);
    showMessage('info', 'Marked all students as present');
  };

  const markAllAbsent = () => {
    const updatedData = {};
    students.forEach(student => {
      updatedData[student._id] = {
        status: 'absent',
        remarks: attendanceData[student._id]?.remarks || ''
      };
    });
    setAttendanceData(updatedData);
    showMessage('info', 'Marked all students as absent');
  };

  const exportToCSV = () => {
    const headers = ['Roll No', 'Name', 'Status', 'Remarks'];
    const rows = filteredStudents.map((student, index) => [
      index + 1,
      student.name,
      attendanceData[student._id]?.status || 'present',
      attendanceData[student._id]?.remarks || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${selectedDate}.csv`;
    a.click();
    showMessage('success', 'Attendance sheet exported!');
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300';
      case 'absent':
        return 'bg-red-100 border-red-300';
      case 'late':
        return 'bg-orange-100 border-orange-300';
      case 'excused':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: Object.values(attendanceData).filter(d => d.status === 'present').length,
    absent: Object.values(attendanceData).filter(d => d.status === 'absent').length,
    late: Object.values(attendanceData).filter(d => d.status === 'late').length,
    excused: Object.values(attendanceData).filter(d => d.status === 'excused').length
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Attendance Sheet</h1>
                <p className="text-slate-500 mt-1">Manage daily attendance with quick actions and clear status.</p>
              </div>
            </div>

            {lastSaved && (
              <div className="text-sm text-slate-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch gap-3">
              <button
                onClick={() => loadStudents()}
                disabled={!selectedClass || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Load Students
                  </>
                )}
              </button>

              <button
                onClick={() => setShowAddStudentModal(true)}
                disabled={!selectedClass}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                title="Add custom student to this class"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>
        </div>
        {students.length > 0 && (
          <>
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total || 0}</p>
                  </div>
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-500">Present</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.present || 0}</p>
                  </div>
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
              </div>

              <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rose-500">Absent</p>
                    <p className="text-2xl font-bold text-rose-700">{stats.absent || 0}</p>
                  </div>
                  <XCircle className="w-7 h-7 text-rose-400" />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-500">Late</p>
                    <p className="text-2xl font-bold text-amber-700">{stats.late || 0}</p>
                  </div>
                  <Clock className="w-7 h-7 text-amber-400" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-500">Excused</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.excused || 0}</p>
                  </div>
                  <AlertCircle className="w-7 h-7 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="autoSave" className="text-sm text-slate-600">
                    Auto-save (2s delay)
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:bg-slate-300"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>

                  <button
                    onClick={markAllPresent}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All Present
                  </button>

                  <button
                    onClick={markAllAbsent}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark All Absent
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 transition"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>

                  <button
                    onClick={() => loadStudents()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => {
                      const status = attendanceData[student._id]?.status || 'present';
                      const isPresent = status === 'present';
                      return (
                        <tr
                          key={student._id}
                          className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${isPresent ? 'bg-emerald-50/40' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full ${student.isCustomAdded ? 'bg-emerald-600' : 'bg-indigo-600'} flex items-center justify-center text-white font-semibold`}>
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                  {student.name}
                                  {student.isCustomAdded && (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Custom</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {student.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleStatusChange(student._id, 'present')}
                                className={`p-2 rounded-lg transition-all ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                                }`}
                                title="Present"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(student._id, 'absent')}
                                className={`p-2 rounded-lg transition-all ${
                                  status === 'absent'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-100'
                                }`}
                                title="Absent"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(student._id, 'late')}
                                className={`p-2 rounded-lg transition-all ${
                                  status === 'late'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                                }`}
                                title="Late"
                              >
                                <Clock className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(student._id, 'excused')}
                                className={`p-2 rounded-lg transition-all ${
                                  status === 'excused'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-100'
                                }`}
                                title="Excused"
                              >
                                <AlertCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={attendanceData[student._id]?.remarks || ''}
                              onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                              placeholder="Add remarks..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                              maxLength={200}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {student.isCustomAdded && (
                              <button
                                onClick={() => handleRemoveStudent(student._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 text-sm rounded-lg hover:bg-rose-50 transition"
                                title="Remove student"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No students found matching your search.
                </div>
              )}
            </div>
          </>
        )}

        {students.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Students Loaded</h3>
            <p className="text-slate-500">
              Select a class, then click “Load Students” to begin marking attendance.
            </p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Add New Student</h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudent({ name: '', email: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddStudent}
                disabled={!newStudent.name || !newStudent.email}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold py-2.5 hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Add Student
              </button>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudent({ name: '', email: '' });
                }}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 font-semibold py-2.5 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSheet;
