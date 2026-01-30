import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../utils/api';
import { CheckCircle, XCircle, Award, Clock, Target, TrendingUp, ArrowLeft } from 'lucide-react';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizResults(id);
      setAttempt(response.data.attempt);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Error loading results');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const mcqResults = results.filter(r => r.type === 'mcq');
  const codingResults = results.filter(r => r.type === 'coding');
  const correctCount = mcqResults.filter(r => r.isCorrect).length;
  const incorrectCount = mcqResults.filter(r => !r.isCorrect).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600" />
            Quiz Results
          </h1>
          <button
            onClick={() => navigate('/student/quizzes')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
        </div>

        {/* Score Card */}
        <div className={`rounded-2xl shadow-xl p-8 mb-8 ${
          attempt.passed ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'
        } text-white`}>
          <div className="text-center mb-6">
            {attempt.passed ? (
              <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 mx-auto mb-4" />
            )}
            <h2 className="text-4xl font-bold mb-2">
              {attempt.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-xl opacity-90">
              {attempt.passed ? 'You passed the quiz!' : 'You did not pass this time'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{attempt.percentage}%</div>
              <div className="text-sm opacity-90 mt-1">Score</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{correctCount}/{results.length}</div>
              <div className="text-sm opacity-90 mt-1">Correct</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{attempt.earnedPoints}/{attempt.totalPoints}</div>
              <div className="text-sm opacity-90 mt-1">Points</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{formatTime(attempt.timeTaken)}</div>
              <div className="text-sm opacity-90 mt-1">Time</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Passing Score</h3>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{attempt.quiz.passingScore}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Your Score</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className={`text-3xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
              {attempt.percentage}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Time Taken</h3>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatTime(attempt.timeTaken)}</p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Results</h2>

          <div className="space-y-6">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  result.type === 'mcq' ? (result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    result.type === 'mcq' ? (result.isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'
                  } text-white font-bold`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {result.question}
                    </h3>

                    {result.type === 'mcq' ? (
                      <>
                        <div className="space-y-2">
                          {result.options.map((option, optionIndex) => {
                            const isSelected = result.selectedAnswer === optionIndex;
                            const isCorrect = result.correctAnswer === optionIndex;

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrect
                                    ? 'border-green-500 bg-green-100'
                                    : isSelected
                                    ? 'border-red-500 bg-red-100'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={isCorrect || isSelected ? 'font-medium' : ''}>
                                    {option}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {isCorrect && (
                                      <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        Correct
                                      </span>
                                    )}
                                    {isSelected && !isCorrect && (
                                      <span className="flex items-center gap-1 text-red-700 text-sm font-medium">
                                        <XCircle className="w-4 h-4" />
                                        Your answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <div className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </div>
                          <div className="text-gray-600">
                            {result.earnedPoints}/{result.points} points
                          </div>
                        </div>
                      </>
                    ) : (
                      // Coding question display
                      <div className="space-y-4">
                        {/* Language Badge */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 font-medium">Language:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {result.language || 'Not Specified'}
                          </span>
                        </div>

                        {/* Starter Code */}
                        {result.starterCode && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-gray-700">Starter Code:</label>
                              <span className="text-xs text-gray-500">Provided template</span>
                            </div>
                            <div className="bg-gray-800 text-gray-100 font-mono text-sm p-4 rounded-lg overflow-auto max-h-48 border-2 border-gray-700">
                              <pre className="whitespace-pre-wrap">{result.starterCode}</pre>
                            </div>
                          </div>
                        )}

                        {/* Submitted Code */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Your Submitted Code:</label>
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.submittedCode ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.submittedCode ? '✓ Submitted' : '✗ Not Submitted'}
                            </span>
                          </div>
                          <div className={`font-mono text-sm p-4 rounded-lg overflow-auto max-h-64 border-2 ${
                            result.submittedCode 
                              ? 'bg-gray-900 text-green-300 border-green-700' 
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}>
                            <pre className="whitespace-pre-wrap">
                              {result.submittedCode || '// No code submitted for this question'}
                            </pre>
                          </div>
                        </div>

                        {/* Review Status & Points */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              result.reviewed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {result.reviewed ? '✓ Reviewed by Teacher' : '⏳ Pending Review'}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-700">
                            <span className="text-blue-600">{result.earnedPoints}</span>
                            <span className="text-gray-400"> / </span>
                            <span>{result.points}</span>
                            <span className="text-sm text-gray-500 ml-1">points</span>
                          </div>
                        </div>

                        {/* AI Feedback Section (if available) */}
                        {result.aiFeedback && (
                          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">🤖 AI Feedback:</h4>
                            <p className="text-sm text-blue-800">{result.aiFeedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-semibold">{results.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Correct Answers:</span>
              <span className="font-semibold text-green-600">{correctCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Incorrect Answers:</span>
              <span className="font-semibold text-red-600">{incorrectCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold">{((correctCount / results.length) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
