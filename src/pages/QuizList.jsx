import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Library,
  Lock,
  Unlock,
  Star,
  AlertCircle,
  CheckSquare,
  PlayCircle,
  ShieldCheck,
  Brain
} from 'lucide-react';

const QuizList = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [studentLevel, setStudentLevel] = useState('Beginner');
  const [showLockedQuizzes, setShowLockedQuizzes] = useState(true);
  const [skillAssessment, setSkillAssessment] = useState(null);
  const [topicFilter, setTopicFilter] = useState([]);
  const [quizEligibility, setQuizEligibility] = useState({
    isEligible: false,
    requiredCompleted: 0,
    requiredTotal: 0,
    averageScore: 0,
    message: ''
  });

  console.log('Current user:', user);
  console.log('User role:', user?.role);

  useEffect(() => {
    // Load skill assessment from localStorage or navigation state
    const storedAssessment = localStorage.getItem('skillAssessment');
    const navigationAssessment = location.state?.skillAssessment;
    
    const assessment = navigationAssessment || (storedAssessment ? JSON.parse(storedAssessment) : null);
    
    if (assessment) {
      setSkillAssessment(assessment);
      setTopicFilter(assessment.selectedTopics || []);
      console.log('Loaded Skill Assessment:', assessment);
      console.log('Topic Filter:', assessment.selectedTopics);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  // Derived filtered quizzes using useMemo to keep filtering reactive and stable
  const computedFilteredQuizzes = React.useMemo(() => {
    if (!quizzes || quizzes.length === 0) return [];

    const difficultyFromRating = (rating) => {
      if (!rating) return null;
      if (rating >= 1 && rating <= 2) return 'Easy';
      if (rating === 3) return 'Medium';
      if (rating >= 4) return 'Hard';
      return null;
    };

    const getRatingForTopic = (ratingsObj, topic) => {
      if (!ratingsObj || !topic) return null;
      if (ratingsObj[topic] !== undefined) return ratingsObj[topic];
      const foundKey = Object.keys(ratingsObj).find(k => k.toLowerCase() === topic.toLowerCase());
      if (foundKey) return ratingsObj[foundKey];
      // common alias support
      const aliases = {
        javascript: ['js', 'javascript'],
        backend: ['backend', 'node', 'node.js', 'express']
      };
      const t = topic.toLowerCase();
      for (const aliasKey of Object.keys(aliases)) {
        if (t === aliasKey || aliases[aliasKey].includes(t)) {
          const foundAlias = Object.keys(ratingsObj).find(k => aliases[aliasKey].includes(k.toLowerCase()) || k.toLowerCase() === aliasKey);
          if (foundAlias) return ratingsObj[foundAlias];
        }
      }
      return null;
    };

    const getTopicDifficulty = (mapObj, topic) => {
      if (!mapObj || !topic) return null;
      if (mapObj[topic]) return mapObj[topic];
      const found = Object.keys(mapObj).find(k => k.toLowerCase() === topic.toLowerCase());
      if (found) return mapObj[found];
      return null;
    };

    const mapQuestionToTopic = (q) => {
      if (!q) return null;
      const subject = (q.subject || q.category || q.topic || q.title || '').toString().toLowerCase();
      const title = (q.title || '').toString().toLowerCase();

      if (subject.includes('html') || title.includes('html')) return 'HTML';
      if (subject.includes('css') || title.includes('css')) return 'CSS';
      if (subject.includes('javascript') || subject.includes('js') || title.includes('javascript')) return 'JavaScript';
      if (subject.includes('react') || title.includes('react')) return 'React';
      if (subject.includes('backend') || subject.includes('node') || subject.includes('express') || title.includes('backend')) return 'Backend';
      if (subject.includes('dsa') || subject.includes('algorithm') || subject.includes('data structure') || title.includes('dsa')) return 'DSA';
      return null;
    };

    const visible = [];

    for (const quiz of quizzes.filter(q => q && q._id)) {
      if (quiz.preview === true || quiz.isPreview === true) continue;
      if (isQuizLocked(quiz)) continue;

      const quizTopic = mapQuizToTopic(quiz);
      if (!quizTopic) continue;

      const ratingForTopic = getRatingForTopic(skillAssessment?.ratings, quizTopic);
      // If student has not rated this topic, skip
      if (!ratingForTopic || ratingForTopic === 0) continue;

      const expectedDifficulty = getTopicDifficulty(skillAssessment?.topicDifficultyMap, quizTopic) || difficultyFromRating(ratingForTopic);

      const allQuestions = Array.isArray(quiz.questions) ? quiz.questions : [];
      const matchingQuestions = allQuestions.filter((q) => {
        const qTopic = mapQuestionToTopic(q) || mapQuizToTopic({ title: q.title || '', subject: q.subject || q.category });
        const qDifficulty = q.difficulty || q.level || null;
        if (!qTopic) return false;
        if (qTopic !== quizTopic) return false;
        if (expectedDifficulty && qDifficulty) return qDifficulty === expectedDifficulty;
        return true;
      });

      const matchingCount = matchingQuestions.length;
      const readyToStart = matchingCount >= 12;
      const displayCount = Math.min(15, matchingCount);

      visible.push({
        ...quiz,
        _derived: { quizTopic, expectedDifficulty, matchingCount, displayCount, readyToStart }
      });
    }

    // Apply class/subject/difficulty filters
    let finalList = visible;
    if (selectedClass !== 'all') finalList = finalList.filter(q => q.class === selectedClass);
    if (selectedSubject !== 'all') finalList = finalList.filter(q => q.subject === selectedSubject);
    if (selectedDifficulty !== 'all') finalList = finalList.filter(q => q.difficulty === selectedDifficulty);

    return finalList;
  }, [quizzes, selectedClass, selectedSubject, selectedDifficulty, skillAssessment, topicFilter]);

  // Keep filteredQuizzes state in sync (some render paths still use it)
  useEffect(() => {
    setFilteredQuizzes(computedFilteredQuizzes);
  }, [computedFilteredQuizzes]);

  useEffect(() => {
    // Calculate student level based on attempts
    if (attempts.length > 0) {
      const level = calculateStudentLevel(attempts, stats);
      setStudentLevel(level);
    }
  }, [attempts, stats]);

  useEffect(() => {
    // Calculate quiz eligibility
    if (quizzes.length > 0 && attempts.length >= 0) {
      const eligibility = calculateQuizEligibility(quizzes, attempts, stats);
      setQuizEligibility(eligibility);
    }
  }, [quizzes, attempts, stats]);

  const calculateQuizEligibility = (quizzes, attempts, stats) => {
    // Categorize quizzes
    const requiredQuizzes = quizzes.filter(q => q.category === 'JavaScript' || q.category === 'React'); // Example: Core subjects
    const requiredTotal = requiredQuizzes.length;
    
    // Count completed required quizzes
    const requiredCompleted = requiredQuizzes.filter(quiz => 
      attempts.some(attempt => attempt.quiz && attempt.quiz._id === quiz._id && attempt.passed)
    ).length;
    
    // Get average score
    const averageScore = stats?.averageScore || 0;
    
    // Eligibility criteria:
    // 1. All required quizzes completed
    // 2. Average score >= 60%
    const isEligible = requiredCompleted === requiredTotal && averageScore >= 60;
    
    let message = '';
    if (isEligible) {
      message = '✓ You are eligible for leave applications';
    } else if (requiredCompleted < requiredTotal) {
      message = `Complete ${requiredTotal - requiredCompleted} more required quiz(es)`;
    } else if (averageScore < 60) {
      message = `Improve your average score to 60% (current: ${averageScore}%)`;
    }
    
    return {
      isEligible,
      requiredCompleted,
      requiredTotal,
      averageScore,
      message
    };
  };

  const categorizeQuiz = (quiz) => {
    // Categorize based on subject/category
    // Required: Core subjects (JavaScript, React, etc.)
    // Practice: Additional topics
    // Readiness: Final assessment (Hard difficulty)
    
    if (quiz.difficulty === 'Hard' && quiz.category === 'DSA') {
      return 'readiness';
    } else if (quiz.category === 'JavaScript' || quiz.category === 'React' || quiz.category === 'Node.js') {
      return 'required';
    } else {
      return 'practice';
    }
  };

  const getQuizCompletion = (quizId) => {
    const attempt = attempts.find(a => a.quiz && a.quiz._id === quizId);
    if (!attempt) return null;
    
    return {
      completed: true,
      passed: attempt.passed,
      score: attempt.percentage,
      attemptId: attempt._id
    };
  };

  const isReadinessUnlocked = () => {
    const requiredQuizzes = quizzes.filter(q => categorizeQuiz(q) === 'required');
    const allRequiredCompleted = requiredQuizzes.every(quiz => 
      attempts.some(attempt => attempt.quiz && attempt.quiz._id === quiz._id && attempt.passed)
    );
    return allRequiredCompleted;
  };

  // Map quiz subject/category to skill assessment topics
  const mapQuizToTopic = (quiz) => {
    if (!quiz) return null;
    
    const subject = (quiz.subject || quiz.category || '').toLowerCase();
    const title = (quiz.title || '').toLowerCase();
    
    // Map quiz subjects to assessment topics
    if (subject.includes('html') || title.includes('html')) return 'HTML';
    if (subject.includes('css') || title.includes('css')) return 'CSS';
    if (subject.includes('javascript') || subject.includes('js') || title.includes('javascript')) return 'JavaScript';
    if (subject.includes('react') || title.includes('react')) return 'React';
    if (subject.includes('backend') || subject.includes('node') || subject.includes('express') || title.includes('backend')) return 'Backend';
    if (subject.includes('dsa') || subject.includes('algorithm') || subject.includes('data structure') || title.includes('dsa')) return 'DSA';
    
    // Default fallback
    return null;
  };

  const calculateStudentLevel = (attempts, stats) => {
    if (!attempts || attempts.length === 0) return 'Beginner';
    
    const avgScore = stats?.averageScore || 0;
    const totalAttempts = attempts.length;
    
    // Level criteria:
    // Advanced: 10+ attempts AND 85%+ avg score
    // Intermediate: 5+ attempts AND 70%+ avg score
    // Beginner: Otherwise
    
    if (totalAttempts >= 10 && avgScore >= 85) {
      return 'Advanced';
    } else if (totalAttempts >= 5 && avgScore >= 70) {
      return 'Intermediate';
    } else {
      return 'Beginner';
    }
  };

  const getQuizLevel = (quiz) => {
    // Map difficulty to levels
    // Easy → Beginner
    // Medium → Intermediate
    // Hard → Advanced
    
    const difficultyMap = {
      'Easy': 'Beginner',
      'Medium': 'Intermediate',
      'Hard': 'Advanced'
    };
    
    return difficultyMap[quiz.difficulty] || 'Beginner';
  };

  const isQuizLocked = (quiz) => {
    const quizLevel = getQuizLevel(quiz);
    const levelHierarchy = ['Beginner', 'Intermediate', 'Advanced'];
    
    const studentLevelIndex = levelHierarchy.indexOf(studentLevel);
    const quizLevelIndex = levelHierarchy.indexOf(quizLevel);
    
    // Lock if quiz level is more than 1 level above student level
    return quizLevelIndex > studentLevelIndex + 1;
  };

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

      // Filter out any null or invalid quiz objects
      const validQuizzes = (quizzesRes.data.quizzes || []).filter(quiz => quiz && quiz._id);
      setQuizzes(validQuizzes);
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
    // Derived filtering to satisfy: show only quizzes for rated topics, hide locked/preview/unrelated
    if (!quizzes || quizzes.length === 0) {
      setFilteredQuizzes([]);
      return;
    }

    // helper: map a single question to a topic using same heuristics as mapQuizToTopic
    const mapQuestionToTopic = (q) => {
      if (!q) return null;
      const subject = (q.subject || q.category || q.topic || q.title || '').toString().toLowerCase();
      const title = (q.title || '').toString().toLowerCase();

      if (subject.includes('html') || title.includes('html')) return 'HTML';
      if (subject.includes('css') || title.includes('css')) return 'CSS';
      if (subject.includes('javascript') || subject.includes('js') || title.includes('javascript')) return 'JavaScript';
      if (subject.includes('react') || title.includes('react')) return 'React';
      if (subject.includes('backend') || subject.includes('node') || subject.includes('express') || title.includes('backend')) return 'Backend';
      if (subject.includes('dsa') || subject.includes('algorithm') || subject.includes('data structure') || title.includes('dsa')) return 'DSA';

      return null;
    };

    const difficultyFromRating = (rating) => {
      if (!rating) return null;
      if (rating >= 1 && rating <= 2) return 'Easy';
      if (rating === 3) return 'Medium';
      if (rating >= 4) return 'Hard';
      return null;
    };

    const visible = [];

    for (const quiz of quizzes.filter(q => q && q._id)) {
      // Exclude preview flag if present
      if (quiz.preview === true || quiz.isPreview === true) continue;

      // Exclude locked quizzes according to existing logic
      if (isQuizLocked(quiz)) continue;

      const quizTopic = mapQuizToTopic(quiz);
      if (!quizTopic) continue; // unrelated

      // Only include topics that the student rated (> 0)
      const getRatingForTopic = (ratingsObj, topic) => {
        if (!ratingsObj || !topic) return null;
        // try exact
        if (ratingsObj[topic] !== undefined) return ratingsObj[topic];
        // try case-insensitive match
        const foundKey = Object.keys(ratingsObj).find(k => k.toLowerCase() === topic.toLowerCase());
        if (foundKey) return ratingsObj[foundKey];
        // try some common aliases
        const aliases = {
          javascript: ['js', 'javascript'],
          backend: ['backend', 'node.js', 'node', 'express']
        };
        const t = topic.toLowerCase();
        for (const aliasKey of Object.keys(aliases)) {
          if (t === aliasKey || aliases[aliasKey].includes(t)) {
            const foundAlias = Object.keys(ratingsObj).find(k => aliases[aliasKey].includes(k.toLowerCase()) || k.toLowerCase() === aliasKey);
            if (foundAlias) return ratingsObj[foundAlias];
          }
        }
        return null;
      };

      const ratingForTopic = getRatingForTopic(skillAssessment?.ratings, quizTopic);
      if (!ratingForTopic || ratingForTopic === 0) {
        // debug: why skipped
        console.debug('Skipping quiz due to zero rating for topic', quiz.title, quizTopic, 'ratingFound=', ratingForTopic);
        continue;
      }

      const getTopicDifficulty = (mapObj, topic) => {
        if (!mapObj || !topic) return null;
        if (mapObj[topic]) return mapObj[topic];
        const found = Object.keys(mapObj).find(k => k.toLowerCase() === topic.toLowerCase());
        if (found) return mapObj[found];
        return null;
      };

      const expectedDifficulty = getTopicDifficulty(skillAssessment?.topicDifficultyMap, quizTopic) || difficultyFromRating(ratingForTopic);

      // Derive question-level topic/difficulty and count matches
      const allQuestions = Array.isArray(quiz.questions) ? quiz.questions : [];

      const matchingQuestions = allQuestions.filter((q) => {
        const qTopic = mapQuestionToTopic(q) || mapQuizToTopic({ title: q.title || '', subject: q.subject || q.category });
        const qDifficulty = q.difficulty || q.level || null;

        if (!qTopic) return false;
        if (qTopic !== quizTopic) return false;
        if (expectedDifficulty && qDifficulty) return qDifficulty === expectedDifficulty;
        // If question doesn't have explicit difficulty, accept it (we'll rely on count)
        return true;
      });

      const matchingCount = matchingQuestions.length;

      // Determine readiness: must have at least 12 matching questions
      const readyToStart = matchingCount >= 12;

      // Determine display count (cap at 15)
      const displayCount = Math.min(15, matchingCount);

      // Attach derived metadata so renderer can use it
      visible.push({
        ...quiz,
        _derived: {
          quizTopic,
          expectedDifficulty,
          matchingCount,
          displayCount,
          readyToStart
        }
      });
    }

    // Apply class/subject/difficulty filters on the derived list
    let finalList = visible;
    if (selectedClass !== 'all') finalList = finalList.filter(q => q.class === selectedClass);
    if (selectedSubject !== 'all') finalList = finalList.filter(q => q.subject === selectedSubject);
    if (selectedDifficulty !== 'all') finalList = finalList.filter(q => q.difficulty === selectedDifficulty);

    setFilteredQuizzes(finalList);
  };

  useEffect(() => {
    if (!quizzes || quizzes.length === 0) return;

    const filtered = quizzes.filter((quiz) => {
      const quizLevel = getQuizLevel(quiz);
      const levelHierarchy = ['Beginner', 'Intermediate', 'Advanced'];

      const studentLevelIndex = levelHierarchy.indexOf(studentLevel);
      const quizLevelIndex = levelHierarchy.indexOf(quizLevel);

      // Check if quiz is within the student's level range
      const isWithinLevel = quizLevelIndex <= studentLevelIndex + 1;

      // Check if quiz topic matches selected topics
      const isTopicSelected = topicFilter.includes(quiz.topic);

      return isWithinLevel && isTopicSelected;
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, studentLevel, topicFilter]);

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
    return attempts.some(attempt => attempt.quiz && attempt.quiz._id === quizId);
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
          <div className="flex items-center gap-3">
            {!skillAssessment && (
              <button
                onClick={() => navigate('/student/skill-assessment')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Start Skill Assessment
              </button>
            )}
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Active Topic Filters (Skill Assessment) */}
        {skillAssessment && topicFilter.length > 0 && (
          <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Active Skill Assessment</h2>
                </div>
                <p className="text-blue-100 text-sm mb-4">
                  Showing quizzes for your selected topics only. Unselected topics are hidden.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {topicFilter.map(topic => (
                    <div key={topic} className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                      <span className="font-semibold">{topic}</span>
                      <span className="text-sm text-gray-600">
                        ({skillAssessment.topicDifficultyMap[topic]} - {skillAssessment.ratings[topic]}/5)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('skillAssessment');
                  setSkillAssessment(null);
                  setTopicFilter([]);
                  navigate('/student/quizzes');
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

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

        {/* Student Level Indicator */}
        <div className={`rounded-xl shadow-md p-6 mb-6 ${
          studentLevel === 'Advanced' ? 'bg-linear-to-r from-purple-500 to-purple-600' :
          studentLevel === 'Intermediate' ? 'bg-linear-to-r from-blue-500 to-blue-600' :
          'bg-linear-to-r from-green-500 to-green-600'
        } text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm opacity-90">Your Current Level</p>
                <h3 className="text-3xl font-bold">{studentLevel}</h3>
                <p className="text-sm opacity-90 mt-1">
                  {studentLevel === 'Beginner' && 'Complete 5+ quizzes with 70%+ average to reach Intermediate'}
                  {studentLevel === 'Intermediate' && 'Complete 10+ quizzes with 85%+ average to reach Advanced'}
                  {studentLevel === 'Advanced' && 'You\'ve mastered the basics! Keep challenging yourself'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Eligibility Status */}
        <div className={`rounded-xl shadow-md p-6 mb-6 border-2 ${
          quizEligibility.isEligible 
            ? 'bg-green-50 border-green-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-lg ${
                quizEligibility.isEligible ? 'bg-green-200' : 'bg-yellow-200'
              }`}>
                {quizEligibility.isEligible ? (
                  <ShieldCheck className="w-8 h-8 text-green-700" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-700" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${
                  quizEligibility.isEligible ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Leave Application Eligibility
                </h3>
                <p className={`text-sm mb-3 ${
                  quizEligibility.isEligible ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {quizEligibility.message}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white bg-opacity-60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Required Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quizEligibility.requiredCompleted}/{quizEligibility.requiredTotal}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Average Score</p>
                    <p className={`text-2xl font-bold ${
                      quizEligibility.averageScore >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {quizEligibility.averageScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        {/* Available Quizzes - Structured by Type */}
        {activeTab === 'available' && (
          <div className="space-y-8">
            {/* Section 1: Required Quizzes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Required Quizzes</h2>
                    <p className="text-sm text-gray-600">Must complete all for leave eligibility</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quizEligibility.requiredCompleted}/{quizEligibility.requiredTotal}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes
                  .filter(quiz => categorizeQuiz(quiz) === 'required')
                  .map((quiz) => {
                    const completion = getQuizCompletion(quiz._id);
                    
                    return (
                      <div
                        key={quiz._id}
                        className={`bg-white rounded-xl border-2 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                          completion?.passed ? 'border-green-400' : 'border-red-300'
                        }`}
                      >
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex-1">{quiz.title}</h3>
                            {completion?.passed && (
                              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="mb-3">
                            {completion ? (
                              completion.passed ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                  ✓ Completed - {completion.score}%
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                  Failed - {completion.score}% (Retry Available)
                                </span>
                              )
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                Not Started
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>

                          {/* Quiz Details */}
                          <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Questions:</span>
                              <span className="font-bold">{quiz._derived ? quiz._derived.displayCount : quiz.questions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-bold">{quiz.duration} mins</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pass Score:</span>
                              <span className="font-bold">{quiz.passingScore}%</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mb-2">
                            {!quiz._derived?.readyToStart && (
                              <p className="text-sm text-red-600 mb-2">
                                Not enough topic-matched questions ({quiz._derived?.matchingCount || 0}) — minimum 12 required.
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (!skillAssessment) {
                                navigate(`/student/skill-assessment`, { state: { quizId: quiz._id, quizTitle: quiz.title } });
                                return;
                              }
                              if (!quiz._derived?.readyToStart) {
                                alert('This quiz does not have enough topic-matched questions (minimum 12) to start.');
                                return;
                              }
                              navigate(`/student/quiz/${quiz._id}`);
                            }}
                            disabled={!quiz._derived?.readyToStart}
                            className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all ${
                              !quiz._derived?.readyToStart ? 'opacity-60 cursor-not-allowed' : ''
                            } ${
                              completion?.passed
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {completion?.passed ? 'Retake Quiz' : completion ? 'Retry Now' : 'Start Quiz'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {filteredQuizzes.filter(q => categorizeQuiz(q) === 'required').length === 0 && (
                <p className="text-center text-gray-500 py-8">No required quizzes available</p>
              )}
            </div>

            {/* Section 2: Practice Quizzes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Practice Quizzes</h2>
                    <p className="text-sm text-gray-600">Optional - No eligibility impact</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes
                  .filter(quiz => categorizeQuiz(quiz) === 'practice')
                  .map((quiz) => {
                    const completion = getQuizCompletion(quiz._id);
                    
                    return (
                      <div
                        key={quiz._id}
                        className="bg-white rounded-xl border-2 border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex-1">{quiz.title}</h3>
                            {completion && (
                              <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
                            )}
                          </div>

                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3">
                            Optional Practice
                          </span>

                          {completion && (
                            <p className="text-sm text-gray-600 mb-2">
                              Last score: <span className="font-bold">{completion.score}%</span>
                            </p>
                          )}

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>

                          <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Questions:</span>
                              <span className="font-bold">{quiz._derived ? quiz._derived.displayCount : quiz.questions.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-bold">{quiz.duration} mins</span>
                            </div>
                          </div>

                          <div className="mb-2">
                            {!quiz._derived?.readyToStart && (
                              <p className="text-sm text-red-600 mb-2">
                                Not enough topic-matched questions ({quiz._derived?.matchingCount || 0}) — minimum 12 required.
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (!skillAssessment) {
                                navigate(`/student/skill-assessment`, { state: { quizId: quiz._id, quizTitle: quiz.title } });
                                return;
                              }
                              if (!quiz._derived?.readyToStart) {
                                alert('This practice quiz does not have enough topic-matched questions (minimum 12) to start.');
                                return;
                              }
                              navigate(`/student/quiz/${quiz._id}`);
                            }}
                            disabled={!quiz._derived?.readyToStart}
                            className={`w-full py-2.5 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all ${!quiz._derived?.readyToStart ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            {completion ? 'Practice Again' : 'Start Practice'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {filteredQuizzes.filter(q => categorizeQuiz(q) === 'practice').length === 0 && (
                <p className="text-center text-gray-500 py-8">No practice quizzes available</p>
              )}
            </div>

            {/* Section 3: Readiness Assessment */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Readiness Assessment</h2>
                    <p className="text-sm text-gray-600">Final gate - Unlocks after completing all required quizzes</p>
                  </div>
                </div>
                {!isReadinessUnlocked() && (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-lg flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Locked
                  </span>
                )}
              </div>

              {!isReadinessUnlocked() ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center">
                  <Lock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">Complete All Required Quizzes First</h3>
                  <p className="text-yellow-800 mb-4">
                    You need to pass all {quizEligibility.requiredTotal} required quizzes before attempting the readiness assessment.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Progress: {quizEligibility.requiredCompleted}/{quizEligibility.requiredTotal} completed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes
                    .filter(quiz => categorizeQuiz(quiz) === 'readiness')
                    .map((quiz) => {
                      const completion = getQuizCompletion(quiz._id);
                      
                      return (
                        <div
                          key={quiz._id}
                          className={`bg-white rounded-xl border-2 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                            completion?.passed ? 'border-green-400' : 'border-purple-300'
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-bold text-gray-900 flex-1">{quiz.title}</h3>
                              {completion?.passed && (
                                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                              )}
                            </div>

                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-3">
                              Final Assessment
                            </span>

                            {completion && (
                              <p className="text-sm text-gray-600 mb-2">
                                Score: <span className={`font-bold ${completion.passed ? 'text-green-600' : 'text-red-600'}`}>
                                  {completion.score}%
                                </span>
                              </p>
                            )}

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>

                            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Questions:</span>
                                <span className="font-bold">{quiz._derived ? quiz._derived.displayCount : quiz.questions.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-bold">{quiz.duration} mins</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pass Score:</span>
                                <span className="font-bold">{quiz.passingScore}%</span>
                              </div>
                            </div>

                            <div className="mb-2">
                              {!quiz._derived?.readyToStart && (
                                <p className="text-sm text-red-600 mb-2">
                                  Not enough topic-matched questions ({quiz._derived?.matchingCount || 0}) — minimum 12 required.
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (!skillAssessment) {
                                  navigate(`/student/skill-assessment`, { state: { quizId: quiz._id, quizTitle: quiz.title } });
                                  return;
                                }
                                if (!quiz._derived?.readyToStart) {
                                  alert('This readiness assessment does not have enough topic-matched questions (minimum 12) to start.');
                                  return;
                                }
                                navigate(`/student/quiz/${quiz._id}`);
                              }}
                              disabled={!quiz._derived?.readyToStart}
                              className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all ${!quiz._derived?.readyToStart ? 'opacity-60 cursor-not-allowed' : ''} ${
                                completion?.passed
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {completion?.passed ? 'Retake Assessment' : completion ? 'Retry Assessment' : 'Start Assessment'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {filteredQuizzes.filter(q => categorizeQuiz(q) === 'readiness').length === 0 && (
                <p className="text-center text-gray-500 py-8">No readiness assessments available</p>
              )}
            </div>
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
                        <div className="font-medium text-gray-900">{attempt.quiz?.title || 'Unknown Quiz'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(attempt.quiz?.category)}`}>
                          {attempt.quiz?.category || 'N/A'}
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
                        {attempt.quiz ? (
                          <button
                            onClick={() => navigate(`/student/quiz/${attempt.quiz._id}/results`)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                          >
                            <Award className="w-4 h-4" />
                            View Results
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Quiz not available</span>
                        )}
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
