import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../utils/api';
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Target,
  ArrowRight,
  Trophy
} from 'lucide-react';

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, attemptsRes] = await Promise.all([
        quizAPI.getAllQuizzes(),
        quizAPI.getMyAttempts(),
      ]);

      setQuizzes(quizzesRes.data.quizzes || []);
      setAttempts(attemptsRes.data.attempts || []);
      setStats(attemptsRes.data.stats);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      JavaScript: 'bg-yellow-100 text-yellow-800',
      React: 'bg-blue-100 text-blue-800',
      'Node.js': 'bg-green-100 text-green-800',
      Database: 'bg-purple-100 text-purple-800',
      Python: 'bg-indigo-100 text-indigo-800',
      DSA: 'bg-pink-100 text-pink-800',
      General: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const isQuizAttempted = (quizId) => {
    return attempts.some(attempt => attempt.quiz._id === quizId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Quiz Center
            </h1>
            <p className="text-gray-600 mt-1">Test your knowledge and improve your skills</p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Attempts</h3>
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Passed</h3>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.passed}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Failed</h3>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'available'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'attempts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Attempts ({attempts.length})
          </button>
        </div>

        {/* Available Quizzes */}
        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{quiz.title}</h3>
                    {isQuizAttempted(quiz._id) && (
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'Test your knowledge with this quiz'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(quiz.category)}`}>
                      {quiz.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {quiz.questions.length} Questions
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {quiz.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      Pass: {quiz.passingScore}%
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                    disabled={isQuizAttempted(quiz._id)}
                    className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      isQuizAttempted(quiz._id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isQuizAttempted(quiz._id) ? 'Completed' : 'Start Quiz'}
                    {!isQuizAttempted(quiz._id) && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No quizzes available</p>
              </div>
            )}
          </div>
        )}

        {/* My Attempts */}
        {activeTab === 'attempts' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{attempt.quiz.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(attempt.quiz.category)}`}>
                          {attempt.quiz.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold">{attempt.percentage}%</div>
                          <div className="text-sm text-gray-500">({attempt.earnedPoints}/{attempt.totalPoints})</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {attempt.passed ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/student/quiz/${attempt.quiz._id}/results`)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          <Award className="w-4 h-4" />
                          View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attempts.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No quiz attempts yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start taking quizzes to see your progress!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
