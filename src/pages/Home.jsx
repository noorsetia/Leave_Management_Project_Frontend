import React from 'react';
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
  Clock
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Academic Validation',
      description: 'Two-level test system ensures students maintain learning continuity during absences.',
      color: 'bg-blue-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Attendance Enforcement',
      description: 'Automatic attendance percentage checks before leave approval.',
      color: 'bg-green-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'AI-Powered Evaluation',
      description: 'Unbiased, automated assessment of quiz and coding tests.',
      color: 'bg-purple-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Role-Based Access',
      description: 'Separate dashboards for students and teachers with appropriate controls.',
      color: 'bg-orange-500',
    },
  ];

  const workflow = [
    'Student submits leave request',
    'Takes MCQ quiz on missed syllabus',
    'Completes coding/practical test',
    'Attendance percentage verified',
    'Teacher reviews AI-generated report',
    'Final decision made',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">LeaveMS</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Advanced Test-Based
              <br />
              <span className="text-blue-200">Leave Management System</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-slide-up">
              A Role-Based, AI-Driven Academic Leave Approval Platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
              <Link to="/signup" className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-all duration-200 border-2 border-white">
                Sign In
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-primary-100">Fair Evaluation</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">2-Level</div>
              <div className="text-primary-100">Testing System</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">Automated</div>
              <div className="text-primary-100">Attendance Check</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive solution that ensures leave doesn't break learning continuity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, transparent, and academically sound
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {workflow.map((step, index) => (
              <div key={index} className="flex items-start mb-8 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="ml-6 flex-grow">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <p className="text-lg font-semibold text-gray-900">{step}</p>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="ml-6 mt-4">
                    <div className="w-0.5 h-8 bg-primary-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transform Your Institution's Leave Management
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Maintains learning continuity during student absences</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Reduces manual workload for teachers</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Ensures transparent and fair decision-making</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Generates audit-ready reports automatically</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Strengthens attendance policy enforcement</p>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/signup" className="btn-primary inline-flex items-center">
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                <BookOpen className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Students</h3>
                <p className="text-gray-600">
                  Maintain academic progress while managing necessary absences through structured testing and validation.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-xl p-6">
                <GraduationCap className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Teachers</h3>
                <p className="text-gray-600">
                  Make informed decisions with AI-generated reports and automated eligibility checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Leave Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join the future of academic governance with our AI-driven platform
          </p>
          <Link to="/signup" className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl">
            Create Your Account Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">LeaveMS</span>
            </div>
            <p className="text-sm">
              © 2026 Advanced Leave Management System. All rights reserved.
            </p>
            <p className="text-sm mt-2">
              Built with React, Node.js, MongoDB, and AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
