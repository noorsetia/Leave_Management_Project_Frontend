import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Shield, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Clock,
  Zap,
  BarChart3,
  Brain,
  Sparkles,
  ChevronRight,
  Star,
  Globe,
  Bell,
  FileText
} from 'lucide-react';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: 'AI-Powered Assessment',
      description: 'Intelligent quiz evaluation with unbiased, instant feedback and detailed analytics.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Smart Validation',
      description: 'Automatic attendance verification ensures policy compliance before approval.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Real-Time Analytics',
      description: 'Track attendance patterns, test scores, and approval rates at a glance.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Instant Decisions',
      description: 'Streamlined workflow reduces approval time from days to hours.',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Role-Based Access',
      description: 'Tailored dashboards for students, teachers, and administrators.',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: 'Learning Continuity',
      description: 'Two-tier testing ensures students stay on track during absences.',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const stats = [
    { value: '100%', label: 'Fair Evaluation', icon: <Star className="w-5 h-5" /> },
    { value: '2-Level', label: 'Testing System', icon: <Target className="w-5 h-5" /> },
    { value: '24/7', label: 'Available', icon: <Globe className="w-5 h-5" /> },
    { value: 'AI-Driven', label: 'Insights', icon: <Brain className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ${
                scrolled ? '' : 'text-white bg-gradient-to-r from-white to-gray-100'
              }`}>
                LeaveMS
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  scrolled 
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI-Powered Leave Management
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Leave Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform academic absences into learning opportunities with{' '}
              <span className="font-semibold text-gray-900">intelligent testing</span>,{' '}
              <span className="font-semibold text-gray-900">automated compliance</span>, and{' '}
              <span className="font-semibold text-gray-900">instant decisions</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                to="/signup" 
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center gap-2"
              >
                <span>Sign In</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center mb-2 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Why Choose LeaveMS</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Built for Modern Education
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A comprehensive platform that maintains academic integrity while simplifying leave management for everyone
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className="relative">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-xl text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mb-6`}>
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow Indicator */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Premium Workflow Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-md">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get started in minutes with our intuitive workflow designed for academic institutions
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" 
                 style={{ width: 'calc(100% - 12rem)', left: '6rem' }}>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {[
                {
                  step: 1,
                  title: "Student Requests",
                  description: "Submit leave requests with attachments through a simple form",
                  icon: <Users className="w-6 h-6" />,
                  gradient: "from-blue-500 to-blue-600"
                },
                {
                  step: 2,
                  title: "Instant Notification",
                  description: "Class teachers receive real-time notifications for review",
                  icon: <Bell className="w-6 h-6" />,
                  gradient: "from-indigo-500 to-indigo-600"
                },
                {
                  step: 3,
                  title: "Quick Approval",
                  description: "Teachers review and approve with a single click",
                  icon: <CheckCircle className="w-6 h-6" />,
                  gradient: "from-purple-500 to-purple-600"
                },
                {
                  step: 4,
                  title: "Stay Updated",
                  description: "Track attendance and manage academic continuity effortlessly",
                  icon: <BarChart3 className="w-6 h-6" />,
                  gradient: "from-pink-500 to-pink-600"
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="relative group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6">
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                      {item.step}
                      {/* Pulse Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-full animate-ping opacity-20`}></div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-transparent">
                    {/* Icon */}
                    <div className={`inline-flex p-3 bg-gradient-to-br ${item.gradient} rounded-lg text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Premium Benefits Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Key Benefits */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-6">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">Enterprise Benefits</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Transform Your Institution
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Experience the power of modern leave management designed specifically for academic excellence
              </p>

              <div className="space-y-5 mb-12">
                {[
                  "Maintains learning continuity during student absences",
                  "Reduces manual workload for teachers by 80%",
                  "Ensures transparent and fair decision-making",
                  "Generates audit-ready reports automatically",
                  "Strengthens attendance policy enforcement"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="ml-4 text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="space-y-6">
              {/* Student Card */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    For Students
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Maintain academic progress while managing necessary absences through structured testing and validation. Never fall behind again.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Easy Submit</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Real-time Status</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Mobile Friendly</span>
                  </div>
                </div>
              </div>

              {/* Teacher Card */}
              <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    For Teachers
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Make informed decisions with AI-generated reports and automated eligibility checks. Focus on teaching, not paperwork.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">One-Click Approve</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">AI Insights</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Auto Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Premium CTA Section */}
      <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          {/* Animated Shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8 text-white">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">Join 100+ Institutions</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Leave Management?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the future of academic governance with our <span className="text-white font-semibold">AI-driven platform</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              Create Your Account Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <button className="inline-flex items-center gap-2 px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
              <FileText className="w-5 h-5" />
              View Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap gap-8 justify-center items-center text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">Free 30-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">
        {/* Top Border Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="text-center">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-white block">LeaveMS</span>
                <span className="text-xs text-gray-500">AI-Powered Leave Management</span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Transforming academic governance through intelligent automation and seamless collaboration
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>

            {/* Bottom Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-gray-500">
                © {new Date().getFullYear()} Advanced Leave Management System. All rights reserved.
              </p>
              
              <div className="flex items-center gap-6">
                <span className="text-gray-600">Built with</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-full text-xs font-medium">React</span>
                  <span className="px-3 py-1 bg-gray-800 text-green-400 rounded-full text-xs font-medium">Node.js</span>
                  <span className="px-3 py-1 bg-gray-800 text-emerald-400 rounded-full text-xs font-medium">MongoDB</span>
                  <span className="px-3 py-1 bg-gray-800 text-purple-400 rounded-full text-xs font-medium">AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

