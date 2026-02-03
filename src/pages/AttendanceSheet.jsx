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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-8 h-8 text-indigo-600" />
                  Attendance Sheet
                </h1>
                <p className="text-gray-600 mt-1">Mark and manage daily attendance</p>
              </div>
            </div>
            
            {lastSaved && (
              <div className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadStudents()}
              disabled={!selectedClass || loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Load Students
                </>
              )}
            </button>
            
            {selectedClass && (
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Add custom student to this class"
              >
                <UserPlus className="w-5 h-5" />
                Add Student
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {students.length > 0 && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-800">{stats.present}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-800">{stats.absent}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Late</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.late}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Excused</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.excused}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="autoSave" className="text-sm text-gray-700">
                    Auto-save (2s delay)
                  </label>
                </div>

                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:bg-gray-300"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Now
                </button>

                <button
                  onClick={markAllPresent}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Present
                </button>

                <button
                  onClick={markAllAbsent}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Mark All Absent
                </button>

                <button
                  onClick={exportToCSV}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>

                <button
                  onClick={() => loadStudents()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Search */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Sheet Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <tr 
                        key={student._id}
                        className={`hover:bg-gray-50 transition-colors ${getStatusColor(attendanceData[student._id]?.status)}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {student.name}
                                {student.isCustomAdded && (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Custom</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(student._id, 'present')}
                              className={`p-2 rounded-lg transition-all ${
                                attendanceData[student._id]?.status === 'present'
                                  ? 'bg-green-600 text-white scale-110'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                              }`}
                              title="Present"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'absent')}
                              className={`p-2 rounded-lg transition-all ${
                                attendanceData[student._id]?.status === 'absent'
                                  ? 'bg-red-600 text-white scale-110'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                              }`}
                              title="Absent"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'late')}
                              className={`p-2 rounded-lg transition-all ${
                                attendanceData[student._id]?.status === 'late'
                                  ? 'bg-orange-600 text-white scale-110'
                                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                              }`}
                              title="Late"
                            >
                              <Clock className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, 'excused')}
                              className={`p-2 rounded-lg transition-all ${
                                attendanceData[student._id]?.status === 'excused'
                                  ? 'bg-blue-600 text-white scale-110'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
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
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            maxLength={200}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {student.isCustomAdded && (
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                              title="Remove student"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No students found matching your search.
                </div>
              )}
            </div>
          </>
        )}

        {students.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Students Loaded
            </h3>
            <p className="text-gray-500">
              Select a class and subject, then click "Load Students" to begin marking attendance.
            </p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Student</h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudent({ name: '', email: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudent.name || !newStudent.email}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setNewStudent({ name: '', email: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSheet;
