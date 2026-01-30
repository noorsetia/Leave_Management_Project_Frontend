import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, quizAPI, leaveAPI } from '../utils/api';
import { 
  BarChart3, 
  Brain, 
  Code, 
  FileText, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  Calendar,
  BookOpen,
  Zap,
  TrendingUp,
  Target,
  ArrowDown
} from 'lucide-react';

const StudentWorkflow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Refs for scrolling
  const attendanceRef = useRef(null);
  const quizRef = useRef(null);
  const codingRef = useRef(null);
  const leaveRef = useRef(null);
  
  // State management
  const [attendance, setAttendance] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [codeSolutions, setCodeSolutions] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch attendance
      try {
        const attendanceRes = await attendanceAPI.getMyAttendance();
        setAttendance(attendanceRes.data);
      } catch (error) {
        setAttendance({ attendancePercentage: 0, totalClasses: 0, attendedClasses: 0, isEligible: false });
      }

      // Fetch quizzes
      try {
        const quizzesRes = await quizAPI.getAllQuizzes();
        setQuizzes(quizzesRes.data.quizzes || []);
      } catch (error) {
        setQuizzes([]);
      }

      // Fetch quiz attempts
      try {
        const attemptsRes = await quizAPI.getMyAttempts();
        setQuizAttempts(attemptsRes.data.attempts || []);
      } catch (error) {
        setQuizAttempts([]);
      }

      // Extract coding-heavy quizzes (quizzes with coding questions)
      // Filter quizzes that contain coding questions and show top 3
      const codingQuizzesData = (quizzesRes.data.quizzes || [])
        .filter(quiz => {
          // Check if quiz has coding questions or is coding-focused
          return quiz.category === 'DSA' || 
                 quiz.subject?.toLowerCase().includes('programming') ||
                 quiz.subject?.toLowerCase().includes('coding') ||
                 quiz.title?.toLowerCase().includes('programming') ||
                 quiz.title?.toLowerCase().includes('coding') ||
                 quiz.description?.toLowerCase().includes('coding');
        })
        .slice(0, 3)
        .map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          difficulty: quiz.difficulty || 'Medium',
          description: quiz.description || `Practice ${quiz.subject} concepts with coding challenges`,
          points: quiz.questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 50,
          quiz: quiz // Keep the full quiz object for navigation
        }));

      // If less than 3, add some default challenges
      if (codingQuizzesData.length < 3) {
        const defaults = [
          {
            id: 'default-1',
            title: "Data Structures Practice",
            difficulty: "Medium",
            description: "Master arrays, linked lists, stacks, and queues with hands-on coding problems",
            points: 50,
            quiz: null
          },
          {
            id: 'default-2',
            title: "Algorithm Fundamentals",
            difficulty: "Easy",
            description: "Learn sorting, searching, and basic algorithmic techniques",
            points: 40,
            quiz: null
          },
          {
            id: 'default-3',
            title: "Problem Solving Challenge",
            difficulty: "Hard",
            description: "Advanced coding problems to test your programming skills",
            points: 75,
            quiz: null
          }
        ];
        
        while (codingQuizzesData.length < 3 && defaults.length > 0) {
          codingQuizzesData.push(defaults.shift());
        }
      }

      setCodingQuestions(codingQuizzesData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800 border-green-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Hard: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      Easy: '⭐',
      Medium: '⭐⭐',
      Hard: '⭐⭐⭐'
    };
    return icons[difficulty] || '⭐';
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleChallenge = (questionId) => {
    setExpandedChallenge(expandedChallenge === questionId ? null : questionId);
  };

  const handleLanguageChange = (questionId, language) => {
    setSelectedLanguages(prev => ({ ...prev, [questionId]: language }));
  };

  const handleCodeChange = (questionId, code) => {
    setCodeSolutions(prev => ({ ...prev, [questionId]: code }));
  };

  const getLanguageOptions = () => [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C',
    'Ruby',
    'Go',
    'PHP',
    'TypeScript',
    'Swift'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gray-600">Complete your learning journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome,</span>
              <span className="font-semibold text-gray-900">{user?.name}</span>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Quick Navigation Pills */}
          <div className="mt-4 flex items-center space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => scrollToSection(attendanceRef)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-all whitespace-nowrap text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Attendance</span>
            </button>
            <ArrowDown className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => scrollToSection(quizRef)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full transition-all whitespace-nowrap text-sm font-medium"
            >
              <Brain className="w-4 h-4" />
              <span>Quizzes</span>
            </button>
            <ArrowDown className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => scrollToSection(codingRef)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full transition-all whitespace-nowrap text-sm font-medium"
            >
              <Code className="w-4 h-4" />
              <span>Coding</span>
            </button>
            <ArrowDown className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => scrollToSection(leaveRef)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-all whitespace-nowrap text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Continuous Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Section 1: Attendance */}
        <section ref={attendanceRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-200 transform transition-all hover:scale-[1.02]">
            {/* Section Header with Number Badge */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-blue-600">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <div className="ml-16 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <BarChart3 className="w-8 h-8 mr-3" />
                    Your Attendance
                  </h2>
                  <p className="text-blue-100 mt-1">Monitor your class participation</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white">
                    {attendance?.attendancePercentage || 0}%
                  </div>
                  <div className={`text-sm font-semibold ${
                    (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {(attendance?.attendancePercentage || 0) >= 75 ? '✓ Eligible' : '✗ Not Eligible'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 transform transition-all hover:scale-105">
                  <div className="text-sm text-blue-600 font-medium mb-2">Total Classes</div>
                  <div className="text-4xl font-bold text-blue-900">
                    {attendance?.totalClasses || 0}
                  </div>
                  <div className="text-xs text-blue-700 mt-2">Scheduled this semester</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 transform transition-all hover:scale-105">
                  <div className="text-sm text-green-600 font-medium mb-2">Classes Attended</div>
                  <div className="text-4xl font-bold text-green-900">
                    {attendance?.attendedClasses || 0}
                  </div>
                  <div className="text-xs text-green-700 mt-2">Great job!</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 transform transition-all hover:scale-105">
                  <div className="text-sm text-red-600 font-medium mb-2">Classes Missed</div>
                  <div className="text-4xl font-bold text-red-900">
                    {(attendance?.totalClasses || 0) - (attendance?.attendedClasses || 0)}
                  </div>
                  <div className="text-xs text-red-700 mt-2">Try to minimize</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Attendance Progress</span>
                  <span className="text-sm font-semibold text-gray-700">
                    Required: <span className="text-blue-600">75%</span>
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div
                    className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-3 ${
                      (attendance?.attendancePercentage || 0) >= 75 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${Math.min(attendance?.attendancePercentage || 0, 100)}%` }}
                  >
                    <span className="text-white font-bold text-xs">
                      {attendance?.attendancePercentage || 0}%
                    </span>
                  </div>
                  {/* 75% marker */}
                  <div className="absolute top-0 left-[75%] h-full w-1 bg-yellow-500">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      75% Goal
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className={`rounded-xl p-6 ${
                (attendance?.attendancePercentage || 0) >= 75 
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'
              }`}>
                <div className="flex items-start">
                  {(attendance?.attendancePercentage || 0) >= 75 ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-bold text-lg ${
                      (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {(attendance?.attendancePercentage || 0) >= 75 
                        ? '🎉 Excellent! You are eligible for leave' 
                        : '⚠️ Improve your attendance to apply for leave'}
                    </h4>
                    <p className={`text-sm mt-2 ${
                      (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {(attendance?.attendancePercentage || 0) >= 75
                        ? 'You have maintained the required 75% attendance. You can proceed with quizzes and leave applications.'
                        : 'You need at least 75% attendance to be eligible for leave. Please attend more classes to improve your percentage.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scroll hint */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => scrollToSection(quizRef)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium animate-bounce"
                >
                  <span>Continue to Quizzes</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Quizzes */}
        <section ref={quizRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-purple-200 transform transition-all hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-purple-600">
                <span className="text-3xl font-bold text-purple-600">2</span>
              </div>
              <div className="ml-16">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <Brain className="w-8 h-8 mr-3" />
                  Available Quizzes
                </h2>
                <p className="text-purple-100 mt-1">Test your knowledge and earn points</p>
              </div>
            </div>

            <div className="p-8">
              {quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl font-medium">No quizzes available at the moment</p>
                  <p className="text-gray-400 text-sm mt-2">Check back later for new quizzes</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => {
                    const attempt = quizAttempts.find(a => a.quiz?._id === quiz._id);
                    const isCompleted = !!attempt;

                    return (
                      <div
                        key={quiz._id}
                        className={`rounded-xl border-3 p-6 transition-all duration-300 hover:shadow-2xl transform hover:scale-105 ${
                          isCompleted 
                            ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100' 
                            : 'border-purple-200 bg-white hover:border-purple-400'
                        }`}
                      >
                        {/* Difficulty Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-md ${getDifficultyColor(quiz.difficulty)}`}>
                            {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty}
                          </span>
                          {isCompleted && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                              <span className="text-xs font-bold text-green-600">DONE</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="font-medium">{quiz.duration} minutes</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="w-4 h-4 mr-2 text-yellow-500" />
                            <span className="font-medium">{quiz.totalPoints} points</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{quiz.questions?.length || 0} questions</span>
                          </div>
                        </div>

                        {isCompleted ? (
                          <div className="space-y-2">
                            <div className="bg-white border-2 border-green-300 rounded-lg p-3 shadow-inner">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Score:</span>
                                <span className="text-2xl font-bold text-green-600">{attempt.percentage}%</span>
                              </div>
                              <div className="text-xs text-center mt-1">
                                {attempt.passed ? (
                                  <span className="text-green-700 font-semibold">✓ Passed</span>
                                ) : (
                                  <span className="text-red-700 font-semibold">✗ Failed</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/student/quiz/${quiz._id}/results`)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition transform hover:scale-105 shadow-md"
                            >
                              View Results
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                          >
                            <Target className="w-5 h-5 mr-2" />
                            Start Quiz
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Scroll hint */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => scrollToSection(codingRef)}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium animate-bounce"
                >
                  <span>Continue to Coding Questions</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Coding Questions */}
        <section ref={codingRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-indigo-200 transform transition-all hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-indigo-600">
                <span className="text-3xl font-bold text-indigo-600">3</span>
              </div>
              <div className="ml-16">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <Code className="w-8 h-8 mr-3" />
                  Coding Challenges
                </h2>
                <p className="text-indigo-100 mt-1">Solve coding problems to enhance your skills</p>
              </div>
            </div>

            <div className="p-8">
              {codingQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Coding Challenges Available</h3>
                  <p className="text-gray-600 mb-6">Check back soon for new coding challenges!</p>
                  <button
                    onClick={() => navigate('/student/quizzes')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    Browse All Quizzes
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                {codingQuestions.map((question, index) => {
                  const isExpanded = expandedChallenge === question.id;
                  const selectedLang = selectedLanguages[question.id] || 'JavaScript';
                  const userCode = codeSolutions[question.id] || '';
                  
                  return (
                  <div
                    key={question.id}
                    className="rounded-xl border-3 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Challenge Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{question.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 ml-13">
                            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-md ${getDifficultyColor(question.difficulty)}`}>
                              {getDifficultyIcon(question.difficulty)} {question.difficulty}
                            </span>
                            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-300">
                              <Award className="w-3 h-3 inline mr-1" />
                              {question.points} points
                            </span>
                          </div>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
                      </div>

                      <p className="text-gray-700 text-sm mb-4 ml-13">{question.description}</p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <button 
                          onClick={() => toggleChallenge(question.id)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                          <Code className="w-5 h-5" />
                          {isExpanded ? 'Hide Problem' : 'View Problem & Write Code'}
                          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {question.quiz && (
                          <button 
                            onClick={() => navigate(`/student/quiz/${question.quiz._id}/take`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center gap-2"
                          >
                            <BookOpen className="w-5 h-5" />
                            Full Quiz
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Coding Problem */}
                    {isExpanded && (
                      <div className="border-t-2 border-indigo-200 bg-white p-6 space-y-6">
                        {/* Problem Statement */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Problem Statement
                          </h4>
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed">{question.description}</p>
                          </div>
                        </div>

                        {/* Language Selector */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Code className="w-5 h-5 text-indigo-600" />
                            Choose Programming Language
                          </h4>
                          <select
                            value={selectedLang}
                            onChange={(e) => handleLanguageChange(question.id, e.target.value)}
                            className="w-full md:w-80 px-4 py-3 border-2 border-indigo-300 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition font-semibold text-gray-800"
                          >
                            {getLanguageOptions().map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            💡 <span>Selected: <strong>{selectedLang}</strong></span>
                          </p>
                        </div>

                        {/* Code Editor */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              ✍️ Write Your Solution
                            </h4>
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                              userCode.trim() 
                                ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                            }`}>
                              {userCode.trim() ? '✓ Code Written' : '⚠ Empty'}
                            </span>
                          </div>
                          
                          <textarea
                            value={userCode}
                            onChange={(e) => handleCodeChange(question.id, e.target.value)}
                            rows={16}
                            className="w-full font-mono text-sm p-4 border-2 border-indigo-300 rounded-lg bg-gray-900 text-green-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none"
                            placeholder={`// Write your ${selectedLang} solution here...\n\n// Example:\nfunction solution() {\n    // Your code here\n    return result;\n}`}
                            spellCheck="false"
                          />
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <span>💡 Tip: Write clean, well-commented code for better evaluation</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Lines: {userCode.split('\n').length} | Chars: {userCode.length}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
                          <button
                            onClick={async () => {
                              if (!userCode.trim()) {
                                alert('Please write some code first!');
                                return;
                              }
                              
                              const confirm = window.confirm(
                                `Submit your ${selectedLang} solution for "${question.title}"?\n\n` +
                                `This will evaluate your code using AI.`
                              );
                              
                              if (confirm) {
                                try {
                                  const response = await quizAPI.evaluateCode(
                                    question.description || question.title,
                                    userCode,
                                    selectedLang
                                  );
                                  
                                  const evaluation = response.data.evaluation;
                                  alert(
                                    `AI Evaluation Results:\n\n` +
                                    `Overall Score: ${evaluation.overallScore}%\n` +
                                    `Correctness: ${evaluation.correctness}%\n` +
                                    `Code Quality: ${evaluation.codeQuality}%\n` +
                                    `Passed: ${evaluation.passed ? 'Yes ✓' : 'No ✗'}\n\n` +
                                    `Feedback: ${evaluation.feedback}\n\n` +
                                    `Strengths: ${evaluation.strengths?.join(', ') || 'N/A'}\n` +
                                    `Improvements: ${evaluation.improvements?.join(', ') || 'N/A'}`
                                  );
                                } catch (error) {
                                  alert('Error evaluating code. Please try again.');
                                  console.error(error);
                                }
                              }
                            }}
                            disabled={!userCode.trim()}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Submit & Evaluate with AI
                          </button>

                          <button
                            onClick={() => {
                              setCodeSolutions(prev => ({ ...prev, [question.id]: '' }));
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Clear Code
                          </button>

                          <button
                            onClick={() => {
                              if (question.quiz) {
                                navigate(`/student/quiz/${question.quiz._id}/take`);
                              } else {
                                alert('Take the full quiz to submit officially and earn points!');
                                navigate('/student/quizzes');
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-5 h-5" />
                            {question.quiz ? 'Go to Full Quiz' : 'Browse Quizzes'}
                          </button>
                        </div>

                        {/* Hints Section */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            💡 Need Help?
                          </h5>
                          <p className="text-sm text-blue-800">
                            • Break down the problem into smaller steps<br/>
                            • Write pseudo-code first before actual code<br/>
                            • Test with sample inputs mentally<br/>
                            • Consider edge cases (empty input, large numbers, etc.)<br/>
                            • Use meaningful variable names
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-6 shadow-inner">
                <div className="flex items-start">
                  <TrendingUp className="w-6 h-6 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-indigo-900">Practice Makes Perfect</h4>
                    <p className="text-sm text-indigo-700 mt-2">
                      Solving coding challenges improves your programming skills and helps you prepare for technical interviews. 
                      Complete these challenges to boost your problem-solving abilities!
                    </p>
                  </div>
                </div>
              </div>
              </>
              )}

              {/* Scroll hint */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => scrollToSection(leaveRef)}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium animate-bounce"
                >
                  <span>Continue to Leave Application</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Apply for Leave */}
        <section ref={leaveRef} className="scroll-mt-32">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-200 transform transition-all hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-green-600">
                <span className="text-3xl font-bold text-green-600">4</span>
              </div>
              <div className="ml-16">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <FileText className="w-8 h-8 mr-3" />
                  Apply for Leave
                </h2>
                <p className="text-green-100 mt-1">Submit your leave application</p>
              </div>
            </div>

            <div className="p-8">
              {/* Eligibility Check */}
              <div className={`rounded-xl p-6 mb-6 shadow-lg ${
                (attendance?.attendancePercentage || 0) >= 75
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-3 border-green-300'
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-3 border-red-300'
              }`}>
                <div className="flex items-start">
                  {(attendance?.attendancePercentage || 0) >= 75 ? (
                    <CheckCircle className="w-8 h-8 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600 mr-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-bold text-2xl ${
                      (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {(attendance?.attendancePercentage || 0) >= 75 
                        ? '✓ Eligibility: Approved' 
                        : '✗ Eligibility: Not Met'}
                    </h3>
                    <p className={`text-sm mt-2 ${
                      (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {(attendance?.attendancePercentage || 0) >= 75
                        ? 'Your attendance is above 75%. You can proceed with your leave application.'
                        : `Your attendance is ${attendance?.attendancePercentage || 0}%. You need at least 75% attendance to apply for leave.`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-bold ${
                      (attendance?.attendancePercentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attendance?.attendancePercentage || 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Application Options */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/student/apply-leave')}
                  disabled={(attendance?.attendancePercentage || 0) < 75}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-3 transition-all duration-300 transform hover:scale-105 ${
                    (attendance?.attendancePercentage || 0) >= 75
                      ? 'border-green-400 bg-gradient-to-r from-green-50 to-green-100 hover:shadow-2xl cursor-pointer'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">Submit New Leave Request</h3>
                      <p className="text-sm text-gray-600">Fill out the leave application form</p>
                    </div>
                  </div>
                  <ChevronRight className="w-8 h-8 text-green-600" />
                </button>

                <button
                  onClick={() => navigate('/student/my-leaves')}
                  className="w-full flex items-center justify-between p-6 rounded-xl border-3 border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">View My Leave Requests</h3>
                      <p className="text-sm text-gray-600">Check status of submitted applications</p>
                    </div>
                  </div>
                  <ChevronRight className="w-8 h-8 text-blue-600" />
                </button>
              </div>

              {/* Back to top */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  <span>Back to Top</span>
                  <ChevronRight className="w-5 h-5 ml-1 rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentWorkflow;
