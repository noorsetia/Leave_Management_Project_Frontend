import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaveAPI } from '../utils/api';

const TakeLeaveAssessment = ({ leaveId: propLeaveId }) => {
  const { id: paramId } = useParams(); // leave request id from route if present
  const leaveId = propLeaveId || paramId;
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leaveId) return;
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await leaveAPI.getAssessmentQuestions(leaveId);
        setAssessment(res.data.assessment);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError(err.response?.data?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [leaveId]);

  const handleSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: { selectedAnswer: value } }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const formattedAnswers = assessment.questions.map((q, idx) => {
      const a = answers[idx];
      if (!a) return { id: idx, selectedAnswer: -1 };
      return { id: idx, selectedAnswer: a.selectedAnswer };
    });

    setSubmitting(true);
    try {
    const res = await leaveAPI.submitAssessment(leaveId, { answers: formattedAnswers, startedAt: new Date().toISOString() });
      alert(`Assessment submitted. Score: ${res.data.score}% - ${res.data.passed ? 'Passed' : 'Failed'}`);
      navigate('/student/my-leaves');
    } catch (err) {
      console.error('Submit assessment error:', err);
      alert(err.response?.data?.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading assessment...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!assessment) {
    return <div className="min-h-screen flex items-center justify-center">No assessment available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Assessment: {assessment.section}</h2>
        <p className="mb-4 text-sm text-gray-600">Answer the following questions. This assessment is linked to your leave request.</p>

        <div className="space-y-4">
          {assessment.questions.map((q, idx) => (
            <div key={idx} className="p-4 border rounded">
              <div className="mb-2 font-medium">{idx + 1}. {q.question}</div>
              {q.options && q.options.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q_${idx}`}
                        checked={answers[idx]?.selectedAnswer === i}
                        onChange={() => handleSelect(idx, i)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea
                    placeholder="Write your answer or code here..."
                    rows={6}
                    className="w-full p-2 border rounded"
                    value={answers[idx]?.code || ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [idx]: { ...(p[idx]||{}), code: e.target.value } }))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
          <button
            onClick={() => navigate('/student/my-leaves')}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeLeaveAssessment;
