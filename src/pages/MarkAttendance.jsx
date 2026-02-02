import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../utils/attendanceApi';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Save, ArrowLeft, Download } from 'lucide-react';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState({
    date: new Date().toISOString().split('T')[0],
    class: '',
    subject: ''
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const classes = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year', 'MCA 1st Year', 'MCA 2nd Year'];
  const subjects = [
    'Data Structures',
    'Web Development',
    'Database Management',
    'Programming in C',
    'Programming in Java',
    'Python',
    'Operating System',
    'Computer Networks',
    'Software Engineering'
  ];

  useEffect(() => {
    if (config.class) {
      fetchStudents();
    }
  }, [config.class, config.date, config.subject]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getStudents({
        class: config.class,
        date: config.date,
        subject: config.subject
      });

      setStudents(response.data.students);

      // Initialize attendance data with existing status or default to present
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

  const handleSaveAttendance = async () => {
    if (!config.class || !config.subject) {
      setErrorMessage('Please select class and subject');
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        status: attendanceData[student._id]?.status || 'present',
        remarks: attendanceData[student._id]?.remarks || ''
      }));

      const response = await attendanceAPI.markAttendance({
        attendanceRecords,
        date: config.date,
        class: config.class,
        subject: config.subject
      });

      setSuccessMessage(`Attendance marked successfully for ${response.data.totalMarked} students!`);
      
      // Refresh the data
      setTimeout(() => {
        fetchStudents();
      }, 1000);

    } catch (error) {
      console.error('Error saving attendance:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
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
        return 'bg-green-100 border-green-300 text-green-800';
      case 'absent':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'late':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'excused':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const stats = {
    present: Object.values(attendanceData).filter(a => a.status === 'present').length,
    absent: Object.values(attendanceData).filter(a => a.status === 'absent').length,
    late: Object.values(attendanceData).filter(a => a.status === 'late').length,
    excused: Object.values(attendanceData).filter(a => a.status === 'excused').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Mark Attendance
            </h1>
            <p className="text-gray-600 mt-1">Record daily attendance for your class</p>
          </div>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Configuration Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={config.date}
                onChange={(e) => setConfig({ ...config, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <select
                value={config.class}
                onChange={(e) => setConfig({ ...config, class: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <select
                value={config.subject}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Subject</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          {students.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleMarkAll('present')}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-lg transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Mark All Absent
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-900">{stats.present}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Late</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.late}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Excused</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.excused}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {config.class ? 'No students found in this class' : 'Please select a class to start marking attendance'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Student</th>
                    <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          {['present', 'absent', 'late', 'excused'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student._id, status)}
                              className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all ${
                                attendanceData[student._id]?.status === status
                                  ? getStatusColor(status)
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                              title={status.charAt(0).toUpperCase() + status.slice(1)}
                            >
                              {getStatusIcon(status)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={attendanceData[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          placeholder="Add remarks (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          maxLength={200}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total Students: <span className="font-bold text-gray-900">{students.length}</span>
              </p>
              <button
                onClick={handleSaveAttendance}
                disabled={saving || !config.class || !config.subject}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
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
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
