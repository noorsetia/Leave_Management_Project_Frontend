import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveAPI, attendanceAPI, dashboardAPI, quizAPI } from '../utils/api';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  BookOpen,
  BarChart3,
  LogOut,
  FileText,
  RefreshCw,
  Award,
  Brain,
  Workflow,
  Sparkles,
  UserCircle,
  ChevronRight,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(target) ? target : 0;
    let startTime;
    let animationFrame;

    const update = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(safeTarget * progress);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return value;
};

const getProgressWidth = (value) => {
  if (value >= 90) return 'w-full';
  if (value >= 75) return 'w-3/4';
  if (value >= 50) return 'w-1/2';
  if (value >= 25) return 'w-1/4';
  return 'w-10';
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [leaveStats, setLeaveStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh data every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Refresh data when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Try to fetch from new dashboard API first
      try {
        const statsRes = await dashboardAPI.getStudentStats();
        const data = statsRes.data;
        
        // Set leave stats
        setLeaveStats({
          total: data.totalRequests || 0,
          pending: data.pendingRequests || 0,
          approved: data.approvedRequests || 0,
          rejected: data.rejectedRequests || 0,
          attendanceStats: data.attendanceStats,
          recentAttendance: data.recentAttendance
        });
        
        // Set recent leaves
        setRecentLeaves(data.recentRequests || []);

        // Set attendance
        setAttendance({
          attendancePercentage: data.attendancePercentage || 0,
          totalClasses: data.attendanceStats?.total || 0,
          attendedClasses: data.attendanceStats?.present || 0,
          isEligible: (data.attendancePercentage || 0) >= 75
        });
      } catch (error) {
        console.error('Error fetching from new API, falling back to old API:', error);
        
        // Fallback to old API structure
        const [statsRes, leavesRes] = await Promise.all([
          leaveAPI.getLeaveStats().catch(() => ({ data: { stats: { total: 0, pending: 0, approved: 0, rejected: 0 } } })),
          leaveAPI.getMyLeaves().catch(() => ({ data: { leaveRequests: [] } })),
        ]);

        setLeaveStats(statsRes.data.stats);
        setRecentLeaves(leavesRes.data.leaveRequests.slice(0, 5));

        // Try to fetch attendance
        try {
          const attendanceRes = await attendanceAPI.getMyAttendance();
          setAttendance(attendanceRes.data);
        } catch (error) {
          setAttendance({ attendancePercentage: 0, totalClasses: 0, attendedClasses: 0, isEligible: false });
        }
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
        
        setQuizStats({
          totalAttempts,
          passedAttempts,
          avgScore
        });
      } catch (error) {
        setQuizStats({ totalAttempts: 0, passedAttempts: 0, avgScore: 0 });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
      approved: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
      rejected: 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800',
      'in-progress': 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800',
    };
    return badges[status] || 'inline-block px-3 py-1 rounded-full text-sm font-semibold';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      'in-progress': <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  const attendancePercentage = attendance?.attendancePercentage || 0;
  const attendanceEligible = attendancePercentage >= 75;
  const attendanceCount = useCountUp(attendancePercentage);
  const quizAverage = Number(quizStats?.avgScore || 0);
  const quizCount = useCountUp(quizAverage);
  const totalCount = useCountUp(leaveStats?.total || 0);
  const approvedCount = useCountUp(leaveStats?.approved || 0);
  const pendingCount = useCountUp(leaveStats?.pending || 0);

  const attendanceProgressWidth = getProgressWidth(attendancePercentage);
  const quizProgressWidth = getProgressWidth(quizAverage);

  const containerVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <motion.header
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="bg-white/80 backdrop-blur-xl border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Welcome back
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  {user?.name || 'Student'}
                </h1>
                <p className="text-slate-500 mt-1">Your progress and leave requests at a glance.</p>
                <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchDashboardData(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold shadow-sm transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh data"
                disabled={refreshing}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-200/60 transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.main
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        {/* KPI Cards */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <motion.div variants={itemVariants} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-500">Attendance</p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {Math.round(attendanceCount)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Current percentage</p>
                </div>
                <span className={`text-sm font-semibold ${attendanceEligible ? 'text-green-600' : 'text-red-600'}`}>
                  {attendanceEligible ? 'Eligible' : 'At Risk'}
                </span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${attendanceEligible ? 'bg-green-500' : 'bg-red-500'} ${attendanceProgressWidth}`}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {attendanceEligible ? 'Great job staying above 75%.' : 'Aim for 75% to unlock leave eligibility.'}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-500">Quiz Score</p>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {quizCount.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Average score</p>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {quizStats?.passedAttempts || 0}/{quizStats?.totalAttempts || 0}
                </span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full bg-purple-500 ${quizProgressWidth}`}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Keep practicing to boost your average.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-500">Total Leaves</p>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{Math.round(totalCount)}</div>
              <p className="text-xs text-slate-500 mt-1">All time requests</p>
              <p className="text-xs text-slate-600 mt-2">
                {leaveStats?.totalDaysApproved || 0} days approved
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-500">Approved</p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600">{Math.round(approvedCount)}</div>
              <p className="text-xs text-slate-500 mt-1">Successful requests</p>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 to-yellow-500"></div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-slate-500">Pending</p>
                <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{Math.round(pendingCount)}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Progress & Motivation */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Eligibility Status</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2">
                    {attendanceEligible ? 'You are eligible for leave.' : 'Boost attendance to unlock leave.'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    {attendanceEligible
                      ? 'Great consistency! Maintain this streak to keep approvals smooth.'
                      : 'Attend a few more classes to reach the 75% threshold.'}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${attendanceEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100">
                <div className={`h-3 rounded-full ${attendanceEligible ? 'bg-emerald-500' : 'bg-amber-500'} ${attendanceProgressWidth}`}></div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{attendancePercentage}% attendance</span>
                <span>Target: 75%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Next Milestone</p>
                  <h3 className="text-2xl font-bold mt-2">Finish your workflow</h3>
                  <p className="text-sm text-blue-100 mt-2">
                    Complete attendance, quiz, and coding to accelerate approvals.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Workflow className="w-6 h-6" />
                </div>
              </div>
              <button
                onClick={() => navigate('/student/workflow')}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
              >
                Continue Workflow
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Action Section */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/apply-leave')}
              className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 text-left shadow-xl shadow-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-100">Primary Action</p>
                  <h3 className="text-2xl font-bold mt-2">Apply for Leave</h3>
                  <p className="text-sm text-blue-100 mt-2">
                    Submit a new leave request with clear details for faster approval.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
              </div>
            </motion.button>

            <div className="grid gap-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/student/progress')}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Progress</p>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">Academic Dashboard</h4>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-500 mt-2">Track grades, goals, and achievements.</p>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/student/workflow')}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Workflow</p>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">Complete Steps</h4>
                  </div>
                  <Workflow className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm text-slate-500 mt-2">Attendance → Quiz → Coding → Leave.</p>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/my-leaves')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FileText className="w-5 h-5 text-slate-500" />
              View My Leaves
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/quizzes')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Brain className="w-5 h-5 text-purple-500" />
              Take Quiz
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/workflow')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowRight className="w-5 h-5 text-indigo-500" />
              Continue Workflow
            </motion.button>
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Recent Activity</p>
              <h2 className="text-2xl font-bold text-slate-900">Leave Requests</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-500" />
            </div>
          </div>

          {recentLeaves.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 text-lg font-semibold">No leave requests yet</p>
              <p className="text-slate-400 text-sm mt-2">Apply for leave to see your activity here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((leave, index) => (
                    <tr key={leave._id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-slate-50 transition-colors`}>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-900">
                        {leave.leaveType}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-900 font-semibold">
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`${getStatusBadge(leave.status)} inline-flex items-center gap-1`}
                        >
                          {getStatusIcon(leave.status)}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recentLeaves.length >= 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/student/my-leaves')}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View all leave requests
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* Recent Attendance Section */}
        {leaveStats && (
          <motion.section variants={itemVariants} className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Attendance Snapshot</p>
                <h2 className="text-2xl font-bold text-slate-900">Last 30 Days</h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Attendance Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-500">Total Days</h4>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {leaveStats.attendanceStats?.total || 0}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-emerald-600">Present</h4>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {leaveStats.attendanceStats?.present || 0}
                </div>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-red-600">Absent</h4>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {leaveStats.attendanceStats?.absent || 0}
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-amber-600">Late</h4>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {leaveStats.attendanceStats?.late || 0}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-blue-600">Excused</h4>
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {leaveStats.attendanceStats?.excused || 0}
                </div>
              </div>
            </div>

            {/* Recent Attendance Records */}
            {leaveStats.recentAttendance && leaveStats.recentAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Teacher</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveStats.recentAttendance.map((record, index) => (
                      <tr key={record._id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-slate-50 transition-colors`}>
                        <td className="py-4 px-4 text-sm text-slate-900">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {record.class}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {record.subject}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                            record.status === 'absent' ? 'bg-red-100 text-red-700' :
                            record.status === 'late' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {record.status === 'present' && <CheckCircle className="w-3 h-3" />}
                            {record.status === 'absent' && <XCircle className="w-3 h-3" />}
                            {record.status === 'late' && <Clock className="w-3 h-3" />}
                            {record.status === 'excused' && <AlertCircle className="w-3 h-3" />}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {record.teacher?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {record.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold">No attendance records yet</p>
                <p className="text-slate-400 text-sm mt-1">Your teacher will mark attendance soon.</p>
              </div>
            )}
          </motion.section>
        )}

        {/* Quick Tips */}
        <motion.section variants={itemVariants} className="mt-10">
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Maintain at least 75% attendance to stay eligible for leave.</li>
                  <li>Leave requests are reviewed by your teachers on working days.</li>
                  <li>Track your leave status anytime in the “My Leaves” section.</li>
                  <li>Provide clear reasons to improve approval time.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default StudentDashboard;
