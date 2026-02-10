import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { leaveAPI } from '../utils/api';
import TakeLeaveAssessment from './TakeLeaveAssessment';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [assessmentRequired, setAssessmentRequired] = useState(false);
  const [assessmentSection, setAssessmentSection] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdLeaveId, setCreatedLeaveId] = useState(null);
  const [showAssessmentInline, setShowAssessmentInline] = useState(false);

  const leaveTypes = [
    'Sick Leave',
    'Personal Leave',
    'Family Emergency',
    'Medical Leave',
    'Other'
  ];

  // Calculate number of days when dates change
  const calculateDays = (start, end) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate >= startDate) {
        const timeDiff = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        setNumberOfDays(days);
      } else {
        setNumberOfDays(0);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate days when dates are selected
    if (name === 'startDate') {
      calculateDays(value, formData.endDate);
    } else if (name === 'endDate') {
      calculateDays(formData.startDate, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.description) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (numberOfDays <= 0) {
      setError('End date must be after or equal to start date');
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData, assessmentRequired, assessmentSection };
      const response = await leaveAPI.createLeaveRequest(payload);
      setSuccess('Leave request submitted successfully!');
      
      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        description: ''
      });
      setAssessmentRequired(false);
      setAssessmentSection('');
      setNumberOfDays(0);

      // If assessment was requested, show the assessment inline for this leave
      if (assessmentRequired && response.data?.leaveRequest?.id) {
        setCreatedLeaveId(response.data.leaveRequest.id);
        setShowAssessmentInline(true);
        return;
      }

      // Otherwise redirect to my leaves page after 1.5 seconds
      setTimeout(() => {
        navigate('/student/my-leaves');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* If showAssessmentInline is true, show the assessment component only */}
          {showAssessmentInline ? (
            <div className="mt-4">
              <TakeLeaveAssessment leaveId={createdLeaveId} />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Number of Days Display */}
            {numberOfDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-3" />
                <p className="text-blue-800 font-medium">
                  Duration: <span className="text-lg">{numberOfDays}</span> {numberOfDays === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description/Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                minLength="10"
                maxLength="500"
                placeholder="Please provide detailed reason for your leave request (minimum 10 characters)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Assessment option */}
            <div className="pt-2 border-t">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={assessmentRequired}
                  onChange={(e) => setAssessmentRequired(e.target.checked)}
                />
                <span className="font-medium">Require assessment as part of leave</span>
              </label>

              {assessmentRequired && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select assessment section</label>
                  <select
                    value={assessmentSection}
                    onChange={(e) => setAssessmentSection(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select section (e.g., Frontend, Backend, DS)</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">If you choose an assessment, you will be asked to complete a short test (MCQ) linked to this leave request.</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Leave Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/my-leaves')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Leave requests must be submitted at least 1 day in advance</li>
              <li>Provide a detailed reason for your leave request</li>
              <li>Your request will be reviewed by a teacher</li>
              <li>You will be notified of the approval status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
