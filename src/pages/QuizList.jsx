import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Trophy,
  Filter,
  GraduationCap,
  Library
} from 'lucide-react';

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [error, setError] = useState(null);

  console.log('Current user:', user);
  console.log('User role:', user?.role);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [selectedClass, selectedSubject, selectedDifficulty, quizzes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [quizzesRes, attemptsRes] = await Promise.all([
        quizAPI.getAllQuizzes(),
        quizAPI.getMyAttempts(),
      ]);

      console.log('Quizzes response:', quizzesRes.data);
      console.log('Attempts response:', attemptsRes.data);

      setQuizzes(quizzesRes.data.quizzes || []);
      // Don't set filteredQuizzes here - let the useEffect handle it
      setAttempts(attemptsRes.data.attempts || []);
      setStats(attemptsRes.data.stats);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to load quizzes');
      setQuizzes([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    console.log('Filtering quizzes...');
    console.log('Quizzes array:', quizzes);
    console.log('Selected class:', selectedClass);
    console.log('Selected subject:', selectedSubject);
    console.log('Selected difficulty:', selectedDifficulty);
    
    let filtered = [...quizzes];

    if (selectedClass !== 'all') {
      console.log('Filtering by class:', selectedClass);
      filtered = filtered.filter(quiz => quiz.class === selectedClass);
    }

    if (selectedSubject !== 'all') {
      console.log('Filtering by subject:', selectedSubject);
      filtered = filtered.filter(quiz => quiz.subject === selectedSubject);
    }

    if (selectedDifficulty !== 'all') {
      console.log('Filtering by difficulty:', selectedDifficulty);
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    console.log('Filtered result:', filtered.length, 'quizzes');
    setFilteredQuizzes(filtered);
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(quizzes.map(q => q.class).filter(Boolean))];
    return classes.sort();
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(quizzes.map(q => q.subject).filter(Boolean))];
    return subjects.sort();
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800 border border-green-300',
      Medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      Hard: 'bg-red-100 text-red-800 border border-red-300',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      Easy: '⭐',
      Medium: '⭐⭐',
      Hard: '⭐⭐⭐',
    };
    return icons[difficulty] || '';
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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Failed to Load Quizzes</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={fetchData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <p className="text-sm text-red-600 mt-4">
                Make sure you are logged in as a student and have a valid session.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="block w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering QuizList');
  console.log('Total quizzes:', quizzes.length);
  console.log('Filtered quizzes:', filteredQuizzes.length);
  console.log('Quizzes array:', quizzes);

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
            Available Quizzes ({filteredQuizzes.length})
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

        {/* Filters - Only show in available quizzes tab */}
        {activeTab === 'available' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Quizzes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Classes</option>
                  {getUniqueClasses().map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Library className="w-4 h-4 inline mr-1" />
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {getUniqueSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Easy">⭐ Easy</option>
                  <option value="Medium">⭐⭐ Medium</option>
                  <option value="Hard">⭐⭐⭐ Hard</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedClass !== 'all' || selectedSubject !== 'all' || selectedDifficulty !== 'all') && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active Filters:</span>
                {selectedClass !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1">
                    {selectedClass}
                    <button
                      onClick={() => setSelectedClass('all')}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSubject !== 'all' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-1">
                    {selectedSubject}
                    <button
                      onClick={() => setSelectedSubject('all')}
                      className="ml-1 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDifficulty !== 'all' && (
                  <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${getDifficultyColor(selectedDifficulty)}`}>
                    {getDifficultyIcon(selectedDifficulty)} {selectedDifficulty}
                    <button
                      onClick={() => setSelectedDifficulty('all')}
                      className="ml-1 hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedClass('all');
                    setSelectedSubject('all');
                    setSelectedDifficulty('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {/* Available Quizzes */}
        {activeTab === 'available' && (
          <div>
            {/* Debug Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Debug Info:</strong> Total quizzes loaded: {quizzes.length}, Filtered: {filteredQuizzes.length}
              </p>
              <p className="text-xs text-blue-700 mb-1">
                <strong>User:</strong> {user?.name} | <strong>Role:</strong> {user?.role} | <strong>ID:</strong> {user?._id}
              </p>
              <p className="text-xs text-blue-700 mb-1">
                <strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
              </p>
              {quizzes.length > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  Sample: {quizzes[0]?.title} (Class: {quizzes[0]?.class}, Subject: {quizzes[0]?.subject})
                </p>
              )}
              <button
                onClick={fetchData}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Retry Fetch
              </button>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
                <p className="text-gray-600">
                  {selectedClass !== 'all' || selectedSubject !== 'all' || selectedDifficulty !== 'all'
                    ? 'No quizzes match your selected filters. Try different criteria.' 
                    : 'No quizzes are currently available.'}
                </p>
                {(selectedClass !== 'all' || selectedSubject !== 'all' || selectedDifficulty !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedClass('all');
                      setSelectedSubject('all');
                      setSelectedDifficulty('all');
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-blue-500"
                  >
                    {/* Quiz Header with Difficulty Badge */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">{quiz.title}</h3>
                        {isQuizAttempted(quiz._id) && (
                          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                        )}
                      </div>

                      {/* Difficulty Badge - Prominent */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${getDifficultyColor(quiz.difficulty)}`}>
                          <span className="text-lg">{getDifficultyIcon(quiz.difficulty)}</span>
                          {quiz.difficulty}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                      {/* Class and Subject Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.class && (
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {quiz.class}
                          </span>
                        )}
                        {quiz.subject && (
                          <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Library className="w-3 h-3" />
                            {quiz.subject}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(quiz.category)}`}>
                          {quiz.category}
                        </span>
                      </div>

                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Questions</span>
                      </span>
                      <span className="font-bold text-blue-600">{quiz.questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Duration</span>
                      </span>
                      <span className="font-bold text-orange-600">{quiz.duration} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Pass Score</span>
                      </span>
                      <span className="font-bold text-green-600">{quiz.passingScore}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                    disabled={isQuizAttempted(quiz._id)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      isQuizAttempted(quiz._id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isQuizAttempted(quiz._id) ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Completed
                      </>
                    ) : (
                      <>
                        Start Quiz
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
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
