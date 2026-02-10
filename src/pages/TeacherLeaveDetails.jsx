import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaveAPI } from '../utils/api';

const TeacherLeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await leaveAPI.getLeaveById(id);
        setLeave(res.data.leaveRequest);
      } catch (err) {
        console.error('Error fetching leave:', err);
        setError(err.response?.data?.message || 'Failed to load leave');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  if (!leave) return <div className="min-h-screen flex items-center justify-center">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Leave Details</h2>
        <p className="text-sm text-gray-600 mb-4">Student: {leave.student?.name} ({leave.student?.email})</p>
        <p className="mb-2"><strong>Type:</strong> {leave.leaveType}</p>
        <p className="mb-2"><strong>Dates:</strong> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
        <p className="mb-4"><strong>Reason:</strong> {leave.description}</p>

        {leave.assessmentRequired ? (
          <div className="mt-6">
            <h3 className="font-semibold">Assessment ({leave.assessmentSection})</h3>
            <p className="text-sm text-gray-500 mb-3">Score: {leave.assessmentScore ?? 'N/A'} {leave.assessmentAttempted ? (leave.assessmentPassed ? '(Passed)' : '(Failed)') : ''}</p>

            {leave.assessmentQuestions && leave.assessmentQuestions.length > 0 && (
              <div className="space-y-3">
                {leave.assessmentQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="font-medium">{idx+1}. {q.question}</div>
                    {q.options && q.options.length > 0 ? (
                      <ul className="list-disc ml-5 mt-2 text-sm">
                        {q.options.map((opt, i) => (
                          <li key={i} className={`${q.correctAnswer === i ? 'text-emerald-700 font-semibold' : ''}`}> {opt} {q.correctAnswer === i && '(Correct)'}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm italic">Coding / open answer question</div>
                    )}

                    {leave.assessmentSubmittedAnswers && leave.assessmentSubmittedAnswers.length > 0 && (
                      <div className="mt-3 bg-gray-50 p-2 rounded text-sm">
                        <div className="font-semibold">Student's Answer:</div>
                        {leave.assessmentSubmittedAnswers[idx] ? (
                          <div>
                            {typeof leave.assessmentSubmittedAnswers[idx].selectedAnswer !== 'undefined' ? (
                              <div>Selected option: {leave.assessmentSubmittedAnswers[idx].selectedAnswer}</div>
                            ) : (
                              <pre className="whitespace-pre-wrap">{leave.assessmentSubmittedAnswers[idx].code}</pre>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No answer submitted for this question</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-600">No assessment requested for this leave.</div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate('/teacher/leave-requests')} className="px-4 py-2 border rounded">Back</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLeaveDetails;
