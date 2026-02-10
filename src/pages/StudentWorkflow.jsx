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
  ArrowDown,
  ArrowRight
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

  const getAverageScore = (attempts) => {
    if (!attempts || attempts.length === 0) return 0;
    const total = attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
    return total / attempts.length;
  };

  const getAverageCompletionTime = (attempts) => {
    if (!attempts || attempts.length === 0) return 0;
    const times = attempts
      .map(attempt => attempt.duration || attempt.timeTaken || attempt.timeSpent || 0)
      .filter(value => typeof value === 'number' && value > 0);
    if (times.length === 0) return 0;
    return times.reduce((sum, value) => sum + value, 0) / times.length;
  };

  const getStudentLevel = () => {
    const attempts = quizAttempts || [];
    const isFirstTime = attempts.length === 0;
    const avgScore = getAverageScore(attempts);
    const failedAttempts = attempts.filter(attempt => attempt.passed === false).length;
    const avgTime = getAverageCompletionTime(attempts);

    if (isFirstTime || avgScore < 50 || failedAttempts >= 3) return 'Beginner';
    if (avgScore <= 75) return 'Intermediate';
    if (avgTime > 45 && avgScore < 85) return 'Intermediate';
    return 'Advanced';
  };

  const getQuizLevel = (quiz) => {
    const difficulty = quiz?.difficulty || 'Medium';
    if (difficulty === 'Easy') return 'Beginner';
    if (difficulty === 'Hard') return 'Advanced';
    return 'Intermediate';
  };

  const studentLevel = getStudentLevel();
  const levelOrder = ['Beginner', 'Intermediate', 'Advanced'];
  const adjacentLevels = {
    Beginner: ['Intermediate'],
    Intermediate: ['Beginner', 'Advanced'],
    Advanced: ['Intermediate']
  };
  const visibleLevels = [studentLevel, ...adjacentLevels[studentLevel]];
  const quizzesByLevel = levelOrder.reduce((acc, level) => {
    acc[level] = (quizzes || []).filter(quiz => getQuizLevel(quiz) === level);
    return acc;
  }, {});

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Page Header */}
        <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Student Learning Workflow
              </h1>
              <p className="text-slate-600 mt-2">
                Follow the guided steps to stay eligible and complete your learning journey with confidence.
              </p>
              <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">Student</p>
                <p className="text-lg font-semibold text-slate-900">{user?.name || 'Student'}</p>
              </div>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold shadow-sm transition-colors hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Start Assessment CTA */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Ready to Start Your Assessment?</h2>
              <p className="text-indigo-100 text-lg">
                Complete your skill assessment, take adaptive quizzes, and solve coding challenges to prove your eligibility.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Skill Assessment Form
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Adaptive Quiz Questions
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Coding Challenges
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Final Evaluation
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/skill-assessment')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Target className="w-6 h-6" />
              Start Assessment Flow
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 1: Attendance */}
        <section ref={attendanceRef} className="scroll-mt-24">
          <div className={`rounded-2xl border shadow-sm p-6 sm:p-8 ${
            (attendance?.attendancePercentage || 0) >= 75
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
                  <p className="text-slate-600">Track your attendance and unlock leave eligibility.</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Current Status</p>
                <p className={`text-xl font-semibold ${
                  (attendance?.attendancePercentage || 0) >= 75 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {(attendance?.attendancePercentage || 0) >= 75 ? 'Eligible' : 'Not Eligible'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total Classes</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{attendance?.totalClasses || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Classes Attended</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{attendance?.attendedClasses || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Classes Missed</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {(attendance?.totalClasses || 0) - (attendance?.attendedClasses || 0)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Attendance Progress</span>
                <span>Required: 75%</span>
              </div>
              <div className="mt-3 h-3 w-full rounded-full bg-white/70 border border-slate-200">
                <div
                  className={`h-3 rounded-full ${
                    (attendance?.attendancePercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  } ${
                    (attendance?.attendancePercentage || 0) >= 90 ? 'w-full' :
                    (attendance?.attendancePercentage || 0) >= 75 ? 'w-3/4' :
                    (attendance?.attendancePercentage || 0) >= 50 ? 'w-1/2' :
                    (attendance?.attendancePercentage || 0) >= 25 ? 'w-1/3' :
                    'w-10'
                  }`}
                ></div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Current: <span className="font-semibold">{attendance?.attendancePercentage || 0}%</span>
              </p>
            </div>

            <div className={`mt-6 rounded-xl border p-4 ${
              (attendance?.attendancePercentage || 0) >= 75
                ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                : 'bg-rose-100 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-start gap-3">
                {(attendance?.attendancePercentage || 0) >= 75 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <div>
                  <p className="font-semibold">
                    {(attendance?.attendancePercentage || 0) >= 75
                      ? 'You’re eligible to proceed to leave applications.'
                      : 'Your attendance needs improvement to unlock leave.'}
                  </p>
                  <p className="text-sm mt-1">
                    {(attendance?.attendancePercentage || 0) >= 75
                      ? 'Keep this momentum going to maintain your eligibility.'
                      : 'Attend more classes to reach the 75% threshold.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Quizzes */}
        <section ref={quizRef} className="scroll-mt-24">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Quizzes</h2>
                  <p className="text-slate-600">Complete quizzes to validate your learning progress.</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Status</p>
                <p className="text-lg font-semibold text-slate-900">
                  {quizzes.length || 0} Available
                </p>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <div className="mt-6 text-center py-12 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">No quizzes available</p>
                <p className="text-sm text-slate-400 mt-1">Check back soon for new assessments.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-10">
                {visibleLevels.map(level => {
                  const levelQuizzes = quizzesByLevel[level] || [];
                  const isPrimaryLevel = level === studentLevel;

                  if (levelQuizzes.length === 0) {
                    return null;
                  }

                  return (
                    <div key={level}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {level} Quizzes
                          </h3>
                          {!isPrimaryLevel && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                              View only
                            </span>
                          )}
                          {isPrimaryLevel && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              Recommended for you
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {isPrimaryLevel
                            ? 'Based on your recent performance, start here for the best progression.'
                            : 'Explore quizzes one level away to preview what’s next.'}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {levelQuizzes.map((quiz) => {
                          const attempt = quizAttempts.find(a => a.quiz?._id === quiz._id);
                          const isCompleted = !!attempt;
                          const isReadOnly = !isPrimaryLevel && !isCompleted;

                          return (
                            <div
                              key={quiz._id}
                              className={`rounded-xl border p-5 shadow-sm transition-all ${
                                isCompleted
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-slate-200 bg-white hover:shadow-md'
                              } ${isReadOnly ? 'opacity-70' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.difficulty)}`}>
                                  {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty || 'Medium'}
                                </span>
                                <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {isCompleted ? 'Completed' : 'Pending'}
                                </span>
                              </div>

                              <h3 className="text-lg font-bold text-slate-900 mt-4">{quiz.title || 'Untitled Quiz'}</h3>
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                {quiz.description || 'No description available.'}
                              </p>

                              <div className="mt-4 space-y-2 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{quiz.duration || 0} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4" />
                                  <span>{quiz.totalPoints || 0} points</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{quiz.questions?.length || 0} questions</span>
                                </div>
                              </div>

                              <div className="mt-5">
                                {isCompleted ? (
                                  <button
                                    onClick={() => navigate(`/student/quiz/${quiz._id}/results`)}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white text-emerald-700 font-semibold py-2.5 hover:bg-emerald-100 transition"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    View Results
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => !isReadOnly && navigate('/student/skill-assessment', {
                                      state: { quizId: quiz._id, quizTitle: quiz.title }
                                    })}
                                    disabled={isReadOnly}
                                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg font-semibold py-2.5 transition ${
                                      isReadOnly
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    <Target className="w-4 h-4" />
                                    {isReadOnly ? 'Locked' : 'Start Quiz'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Step 3: Coding Challenges */}
        <section ref={codingRef} className="scroll-mt-24">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Coding Challenges</h2>
                  <p className="text-slate-600">Solve coding tasks to build practical skills.</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Challenges</p>
                <p className="text-lg font-semibold text-slate-900">
                  {codingQuestions.length || 0} Available
                </p>
              </div>
            </div>

            {codingQuestions.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <Code className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">No coding challenges available</p>
                <p className="text-sm text-slate-400 mt-1">Explore quizzes while new challenges are being added.</p>
                <button
                  onClick={() => navigate('/student/quizzes')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white font-semibold px-4 py-2.5 hover:bg-slate-800 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Quizzes
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {codingQuestions.map((question, index) => {
                  const isExpanded = expandedChallenge === question.id;
                  const selectedLang = selectedLanguages[question.id] || 'JavaScript';
                  const userCode = codeSolutions[question.id] || '';

                  return (
                    <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50">
                      <div className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {question.title || 'Coding Challenge'}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">
                              {question.description || 'Challenge details are not available.'}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                                {getDifficultyIcon(question.difficulty)} {question.difficulty || 'Medium'}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600">
                                {question.points || 0} points
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleChallenge(question.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white font-semibold px-4 py-2.5 hover:bg-slate-800 transition"
                          >
                            <Code className="w-4 h-4" />
                            {isExpanded ? 'Hide Details' : 'View & Solve'}
                          </button>
                        </div>

                        {question.quiz && (
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => navigate('/student/skill-assessment', {
                                state: { quizId: question.quiz._id, quizTitle: question.quiz.title }
                              })}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              <BookOpen className="w-4 h-4" />
                              Take Full Quiz Assessment
                            </button>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white p-6 space-y-5">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700">Problem Statement</h4>
                            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                              {question.description || 'No description available.'}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-700">Programming Language</h4>
                            <select
                              value={selectedLang}
                              onChange={(e) => handleLanguageChange(question.id, e.target.value)}
                              className="mt-2 w-full md:w-80 px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                              {getLanguageOptions().map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">Selected: {selectedLang}</p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-slate-700">Write Your Solution</h4>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                userCode.trim()
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {userCode.trim() ? 'Code added' : 'Empty'}
                              </span>
                            </div>
                            <textarea
                              value={userCode}
                              onChange={(e) => handleCodeChange(question.id, e.target.value)}
                              rows={14}
                              className="mt-2 w-full font-mono text-sm p-4 border border-slate-200 rounded-lg bg-slate-900 text-emerald-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                              placeholder={`// Write your ${selectedLang} solution here...`}
                              spellCheck="false"
                            />
                            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-2 gap-2">
                              <span>Tip: Keep your solution clean and well-commented.</span>
                              <span>Lines: {userCode.split('\n').length} | Chars: {userCode.length}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              className="rounded-lg bg-emerald-600 text-white font-semibold py-2.5 px-4 hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:text-slate-500"
                            >
                              Submit & Evaluate
                            </button>

                            <button
                              onClick={() => {
                                setCodeSolutions(prev => ({ ...prev, [question.id]: '' }));
                              }}
                              className="rounded-lg bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 hover:bg-slate-300 transition"
                            >
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
                              className="rounded-lg bg-slate-900 text-white font-semibold py-2.5 px-4 hover:bg-slate-800 transition"
                            >
                              {question.quiz ? 'Go to Full Quiz' : 'Browse Quizzes'}
                            </button>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">Need a hint?</p>
                            <p className="mt-1">Break the problem into steps, write pseudo-code, and consider edge cases.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Step 4: Leave Application */}
        <section ref={leaveRef} className="scroll-mt-24">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Leave Application</h2>
                  <p className="text-slate-600">Submit your leave request when eligible.</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Eligibility</p>
                <p className={`text-lg font-semibold ${
                  (attendance?.attendancePercentage || 0) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {(attendance?.attendancePercentage || 0) >= 75 ? 'Approved' : 'Blocked'}
                </p>
              </div>
            </div>

            <div className={`mt-6 rounded-xl border p-4 ${
              (attendance?.attendancePercentage || 0) >= 75
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-start gap-3">
                {(attendance?.attendancePercentage || 0) >= 75 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <div>
                  <p className="font-semibold">
                    {(attendance?.attendancePercentage || 0) >= 75
                      ? 'You meet the attendance requirement.'
                      : 'Attendance below 75% — leave application is locked.'}
                  </p>
                  <p className="text-sm mt-1">
                    {(attendance?.attendancePercentage || 0) >= 75
                      ? 'Proceed to submit your leave application.'
                      : `Your attendance is ${(attendance?.attendancePercentage || 0)}%. Keep attending to unlock leave eligibility.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => navigate('/student/apply-leave')}
                disabled={(attendance?.attendancePercentage || 0) < 75}
                className={`w-full flex items-center justify-between rounded-xl border p-5 transition ${
                  (attendance?.attendancePercentage || 0) >= 75
                    ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (attendance?.attendancePercentage || 0) >= 75 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'
                  }`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900">Submit New Leave Request</p>
                    <p className="text-sm text-slate-600">Fill out the leave application form.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/student/my-leaves')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900">View My Leave Requests</p>
                    <p className="text-sm text-slate-600">Track submissions and approvals.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentWorkflow;
