import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../utils/api';
import { CheckCircle, XCircle, Award, Clock, Target, TrendingUp, ArrowLeft, ArrowRight, AlertTriangle, Lightbulb, Star, ShieldCheck, Brain, BarChart } from 'lucide-react';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillAssessment, setSkillAssessment] = useState(null);

  useEffect(() => {
    fetchResults();
    
    // Load skill assessment if available
    const stored = localStorage.getItem('currentQuizAssessment');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.quizId === id) {
        setSkillAssessment(data.assessment);
      }
    }
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

  // Calculate accuracy
  const accuracy = results.length > 0 ? ((correctCount / mcqResults.length) * 100).toFixed(1) : 0;

  // Analyze weak topics (questions that were answered incorrectly)
  const weakTopics = results
    .filter(r => r.type === 'mcq' && !r.isCorrect)
    .map(r => r.question)
    .slice(0, 5); // Top 5 weak areas

  // Performance feedback
  const getPerformanceFeedback = () => {
    const score = attempt.percentage;
    if (score >= 90) return { text: 'Excellent! Outstanding performance', color: 'text-green-600', icon: Star };
    if (score >= 75) return { text: 'Great! Solid understanding', color: 'text-blue-600', icon: TrendingUp };
    if (score >= 60) return { text: 'Good effort! Room for improvement', color: 'text-yellow-600', icon: Lightbulb };
    return { text: 'Keep practicing! Review the material', color: 'text-red-600', icon: AlertTriangle };
  };

  const feedback = getPerformanceFeedback();
  const FeedbackIcon = feedback.icon;

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

        {/* Self-Assessment vs Performance Comparison */}
        {skillAssessment && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 mb-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Self-Assessment vs Actual Performance</h2>
                <p className="text-sm text-gray-600">How did your self-rating match your performance?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Self-Rated Level */}
              <div className="bg-white rounded-lg p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Your Self-Assessment</h3>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Skill Level:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      skillAssessment.level === 'Advanced' ? 'bg-purple-100 text-purple-700' :
                      skillAssessment.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {skillAssessment.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating:</span>
                    <span className="text-xl font-bold text-gray-900">{skillAssessment.avgRating} / 5.0</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Skills Rated:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(skillAssessment.ratings).map(([skill, rating]) => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill}: {rating}/5
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actual Performance */}
              <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Actual Performance</h3>
                  <BarChart className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quiz Result:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score Achieved:</span>
                    <span className="text-xl font-bold text-gray-900">{attempt.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accuracy:</span>
                    <span className="text-xl font-bold text-gray-900">{accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Insight */}
            <div className="bg-white rounded-lg p-6 border-2 border-indigo-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Insight
              </h3>
              {(() => {
                const selfConfidence = parseFloat(skillAssessment.avgRating);
                const actualPerformance = attempt.percentage / 20; // Convert to 1-5 scale

                if (Math.abs(selfConfidence - actualPerformance) < 0.5) {
                  return (
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">Great self-awareness!</span> Your self-assessment 
                      closely matched your actual performance. You have a good understanding of your skill level.
                    </p>
                  );
                } else if (selfConfidence > actualPerformance + 0.5) {
                  return (
                    <p className="text-gray-700">
                      <span className="font-semibold text-blue-600">Opportunity for growth!</span> Your self-assessment 
                      was higher than your performance. This suggests there may be gaps in your knowledge. Consider 
                      reviewing the weak areas identified below and practicing more.
                    </p>
                  );
                } else {
                  return (
                    <p className="text-gray-700">
                      <span className="font-semibold text-purple-600">Underestimated yourself!</span> You performed 
                      better than your self-assessment suggested. You're more capable than you think! Keep building 
                      your confidence.
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        )}

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
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
              <span className="font-semibold">{accuracy}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Performance Report */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Detailed Performance Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Accuracy Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Accuracy Rate</h3>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{accuracy}%</p>
              <p className="text-xs text-blue-600 mt-2">
                {correctCount} out of {mcqResults.length} questions correct
              </p>
            </div>

            {/* Time Efficiency */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-900">Time Taken</h3>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-700">{formatTime(attempt.timeTaken)}</p>
              <p className="text-xs text-orange-600 mt-2">
                {attempt.timeTaken < (attempt.quiz.duration * 60 * 0.5) ? 'Very fast!' : 
                 attempt.timeTaken < (attempt.quiz.duration * 60 * 0.75) ? 'Good pace' : 
                 'Took your time'}
              </p>
            </div>

            {/* Score Achievement */}
            <div className={`rounded-lg p-5 border-2 ${
              attempt.passed 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${attempt.passed ? 'text-green-900' : 'text-red-900'}`}>
                  Score
                </h3>
                {attempt.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-3xl font-bold ${attempt.passed ? 'text-green-700' : 'text-red-700'}`}>
                {attempt.percentage}%
              </p>
              <p className={`text-xs mt-2 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                {attempt.passed ? 'Passed!' : `Need ${attempt.quiz.passingScore}% to pass`}
              </p>
            </div>
          </div>

          {/* Performance Feedback */}
          <div className={`p-4 rounded-lg border-2 mb-6 ${
            attempt.percentage >= 90 ? 'bg-green-50 border-green-200' :
            attempt.percentage >= 75 ? 'bg-blue-50 border-blue-200' :
            attempt.percentage >= 60 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <FeedbackIcon className={`w-8 h-8 ${feedback.color}`} />
              <div>
                <h3 className={`font-bold text-lg ${feedback.color}`}>{feedback.text}</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {attempt.percentage >= 90 && 'You have demonstrated exceptional understanding of the material.'}
                  {attempt.percentage >= 75 && attempt.percentage < 90 && 'You have a good grasp of most concepts. Focus on weak areas for improvement.'}
                  {attempt.percentage >= 60 && attempt.percentage < 75 && 'You understand the basics but need more practice in several areas.'}
                  {attempt.percentage < 60 && 'Review the material thoroughly and practice more before retaking.'}
                </p>
              </div>
            </div>
          </div>

          {/* Weak Topics Analysis */}
          {weakTopics.length > 0 && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {weakTopics.map((topic, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="text-yellow-600 shrink-0">•</span>
                    <span className="line-clamp-2">{topic}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-yellow-700 mt-3 italic">
                💡 Tip: Review these topics and practice similar questions to improve your score.
              </p>
            </div>
          )}

          {/* Strengths (if passed with high score) */}
          {attempt.percentage >= 75 && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Strengths
              </h3>
              <p className="text-sm text-green-800">
                {attempt.percentage >= 90 && 'Excellent performance across all areas! You have mastered this topic.'}
                {attempt.percentage >= 75 && attempt.percentage < 90 && `Strong understanding demonstrated. You answered ${correctCount} questions correctly with good consistency.`}
              </p>
            </div>
          )}

          {/* Eligibility Impact */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${
            attempt.passed ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
              attempt.passed ? 'text-blue-900' : 'text-orange-900'
            }`}>
              <ShieldCheck className="w-5 h-5" />
              Eligibility Impact
            </h3>
            <p className={`text-sm ${attempt.passed ? 'text-blue-800' : 'text-orange-800'}`}>
              {attempt.passed ? (
                <>
                  ✓ This quiz counts toward your leave application eligibility. 
                  {attempt.percentage >= 90 && ' Excellent score! This significantly boosts your overall average.'}
                  {attempt.percentage >= 75 && attempt.percentage < 90 && ' Good work! This contributes positively to your eligibility.'}
                  {attempt.percentage < 75 && ' You passed, but improving your score on retake would strengthen your eligibility.'}
                </>
              ) : (
                <>
                  This quiz does not count toward eligibility until you pass. Retake it to improve your score and meet the requirements.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Next Step: Coding Challenge */}
        {attempt.passed && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready for the Next Challenge?</h2>
                <p className="opacity-90">Complete coding challenges to finalize your evaluation</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm mb-6">
              <h3 className="font-semibold text-lg mb-4">What's Next:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Take adaptive coding challenges based on your DSA skill level</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Write and test code in real-time with instant feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Combine quiz + coding scores for final leave eligibility</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                const assessment = localStorage.getItem('skillAssessment');
                const parsedAssessment = assessment ? JSON.parse(assessment) : null;
                
                navigate('/student/coding-challenge', {
                  state: {
                    quizAttempt: attempt,
                    skillAssessment: parsedAssessment || skillAssessment
                  }
                });
              }}
              className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              Continue to Coding Challenge
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
