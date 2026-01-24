import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, quizAPI, dashboardAPI } from '../utils/api';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Target,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Star,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';

const StudentProgress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [attendance, setAttendance] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, semester
  
  useEffect(() => {
    fetchProgressData();
  }, [selectedPeriod]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch attendance data
      try {
        const attendanceRes = await attendanceAPI.getMyAttendance();
        setAttendance(attendanceRes.data);
      } catch (error) {
        setAttendance({ attendancePercentage: 0, totalClasses: 0, attendedClasses: 0 });
      }

      // Fetch quiz statistics
      try {
        const quizAttemptsRes = await quizAPI.getMyAttempts();
        const attempts = quizAttemptsRes.data.attempts || [];
        
        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter(a => a.passed).length;
        const avgScore = totalAttempts > 0 
          ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(1)
          : 0;
        
        // Calculate improvement
        const recentAttempts = attempts.slice(-5);
        const oldAttempts = attempts.slice(0, -5);
        const recentAvg = recentAttempts.length > 0
          ? recentAttempts.reduce((sum, a) => sum + a.percentage, 0) / recentAttempts.length
          : 0;
        const oldAvg = oldAttempts.length > 0
          ? oldAttempts.reduce((sum, a) => sum + a.percentage, 0) / oldAttempts.length
          : 0;
        const improvement = recentAvg - oldAvg;
        
        setQuizStats({
          totalAttempts,
          passedAttempts,
          avgScore,
          improvement: improvement.toFixed(1),
          recentAttempts: attempts.slice(-10).reverse()
        });
      } catch (error) {
        setQuizStats({ totalAttempts: 0, passedAttempts: 0, avgScore: 0, improvement: 0, recentAttempts: [] });
      }

      // Generate weekly attendance data (mock data - replace with real API)
      const weekData = generateWeeklyData();
      setWeeklyData(weekData);

      // Generate monthly trend (mock data)
      const monthData = generateMonthlyTrend();
      setMonthlyTrend(monthData);

      // Calculate streak
      const streak = calculateStreak();
      setCurrentStreak(streak);

      // Generate achievements
      const studentAchievements = generateAchievements(attendance, quizStats);
      setAchievements(studentAchievements);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      attendance: Math.random() > 0.2 ? 100 : 0,
      quizScore: Math.floor(Math.random() * 30) + 70,
      tasksCompleted: Math.floor(Math.random() * 5)
    }));
  };

  const generateMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      attendance: Math.floor(Math.random() * 20) + 75,
      avgQuizScore: Math.floor(Math.random() * 20) + 75
    }));
  };

  const calculateStreak = () => {
    // Mock streak calculation
    return Math.floor(Math.random() * 30) + 10;
  };

  const generateAchievements = (attendance, quizStats) => {
    const achievements = [];
    
    if (attendance?.attendancePercentage >= 95) {
      achievements.push({
        id: 1,
        title: 'Perfect Attendance',
        description: 'Maintained 95%+ attendance',
        icon: '🎯',
        color: 'gold',
        unlocked: true
      });
    }
    
    if (quizStats?.avgScore >= 90) {
      achievements.push({
        id: 2,
        title: 'Quiz Master',
        description: 'Achieved 90%+ average score',
        icon: '🏆',
        color: 'purple',
        unlocked: true
      });
    }
    
    if (currentStreak >= 30) {
      achievements.push({
        id: 3,
        title: '30-Day Streak',
        description: 'Consistent for 30 days',
        icon: '🔥',
        color: 'orange',
        unlocked: true
      });
    }

    // Add locked achievements
    if (attendance?.attendancePercentage < 100) {
      achievements.push({
        id: 4,
        title: 'Never Miss',
        description: '100% attendance for semester',
        icon: '👑',
        color: 'gray',
        unlocked: false
      });
    }

    return achievements;
  };

  const getProgressColor = (value) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBg = (value) => {
    if (value >= 90) return 'bg-green-100 border-green-300';
    if (value >= 75) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Academic Progress Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your performance and achievements</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchProgressData}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mt-4 flex space-x-2">
            {['week', 'month', 'semester'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Performance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{attendance?.attendancePercentage || 0}%</div>
                <div className="text-sm opacity-90">Overall</div>
              </div>
            </div>
            <div className="text-sm opacity-90">Attendance Rate</div>
            <div className="mt-2 flex items-center text-xs">
              {getTrendIcon(5)}
              <span className="ml-1">+5% from last month</span>
            </div>
          </div>

          {/* Quiz Performance */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{quizStats?.avgScore || 0}%</div>
                <div className="text-sm opacity-90">Average</div>
              </div>
            </div>
            <div className="text-sm opacity-90">Quiz Score</div>
            <div className="mt-2 flex items-center text-xs">
              {getTrendIcon(quizStats?.improvement)}
              <span className="ml-1">{quizStats?.improvement > 0 ? '+' : ''}{quizStats?.improvement}% improvement</span>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{currentStreak}</div>
                <div className="text-sm opacity-90">Days</div>
              </div>
            </div>
            <div className="text-sm opacity-90">Current Streak</div>
            <div className="mt-2 text-xs opacity-90">
              Keep it up! 🔥
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm opacity-90">Unlocked</div>
              </div>
            </div>
            <div className="text-sm opacity-90">Achievements</div>
            <div className="mt-2 text-xs opacity-90">
              {achievements.length - achievements.filter(a => a.unlocked).length} more to unlock
            </div>
          </div>
        </div>

        {/* Detailed Progress Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Attendance Breakdown
              </h3>
            </div>
            <div className="p-6">
              {/* Weekly Chart */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">This Week</h4>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`h-20 rounded-lg mb-2 flex items-end justify-center ${
                        day.attendance === 100 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <div className="text-white text-xs mb-1">
                          {day.attendance === 100 ? '✓' : '✗'}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-600">{day.day}</div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendance?.attendedClasses || 0}
                    </div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(attendance?.totalClasses || 0) - (attendance?.attendedClasses || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendance?.totalClasses || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Performance Graph */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Quiz Performance Trend
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Recent Attempts</h4>
                {quizStats?.recentAttempts?.length > 0 ? (
                  <div className="space-y-3">
                    {quizStats.recentAttempts.slice(0, 5).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            attempt.passed ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {attempt.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{attempt.quiz?.title || 'Quiz'}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${
                          attempt.percentage >= 90 ? 'text-green-600' : 
                          attempt.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No quiz attempts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Analysis */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              6-Month Performance Trend
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between space-x-2 h-64">
              {monthlyTrend.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full space-y-2">
                    {/* Attendance Bar */}
                    <div className="relative">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-700"
                        style={{ height: `${month.attendance * 2}px` }}
                      />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">
                        {month.attendance}%
                      </div>
                    </div>
                    {/* Quiz Score Bar */}
                    <div className="relative">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-700"
                        style={{ height: `${month.avgQuizScore * 2}px` }}
                      />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-purple-600">
                        {month.avgQuizScore}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-2">{month.month}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-6 mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-sm text-gray-700">Attendance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
                <span className="text-sm text-gray-700">Quiz Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-yellow-100">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Achievements & Milestones
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`relative p-6 rounded-2xl border-2 text-center transform transition-all hover:scale-105 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {achievement.unlocked && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{achievement.title}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                  {!achievement.unlocked && (
                    <div className="mt-2 text-xs text-gray-500">🔒 Locked</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals and Targets */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-100">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Goals & Targets
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Attendance Goal */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Maintain 90% Attendance</span>
                  <span className="text-sm font-bold text-blue-600">
                    {attendance?.attendancePercentage || 0}% / 90%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min((attendance?.attendancePercentage || 0) / 90 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Quiz Goal */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Achieve 85% Average Quiz Score</span>
                  <span className="text-sm font-bold text-purple-600">
                    {quizStats?.avgScore || 0}% / 85%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min((quizStats?.avgScore || 0) / 85 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Streak Goal */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Build 30-Day Streak</span>
                  <span className="text-sm font-bold text-orange-600">
                    {currentStreak} / 30 Days
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                    style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/student/workflow')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
