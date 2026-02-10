import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, TrendingUp, Code, BookOpen, CheckCircle, XCircle, Star, ArrowLeft, Trophy, Target, Zap, ShieldCheck, Brain } from 'lucide-react';

const FinalEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizAttempt, skillAssessment, codingSubmissions, finalScore, difficultyLevel } = location.state || {};

  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    if (!quizAttempt || !codingSubmissions) {
      alert('Missing evaluation data');
      navigate('/student/quizzes');
      return;
    }

    // Calculate final eligibility
    calculateEligibility();
  }, []);

  const calculateEligibility = () => {
    const quizScore = quizAttempt.percentage;
    const codingScores = codingSubmissions.map(s => s.score);
    const avgCodingScore = codingScores.reduce((a, b) => a + b, 0) / codingScores.length;
    const passedCodingCount = codingSubmissions.filter(s => s.passed).length;
    
    // Eligibility criteria:
    // 1. Quiz score >= 60%
    // 2. Average coding score >= 50%
    // 3. At least 50% of coding challenges passed
    
    const quizPassed = quizScore >= 60;
    const codingPassed = avgCodingScore >= 50;
    const challengesPassed = passedCodingCount >= codingSubmissions.length / 2;
    
    const isEligible = quizPassed && codingPassed && challengesPassed;
    
    let message = '';
    let suggestions = [];
    
    if (isEligible) {
      message = '🎉 Congratulations! You are eligible to apply for leave.';
      suggestions = [
        'Your combined performance meets all requirements',
        'You demonstrated strong theoretical and practical skills',
        'You can now proceed to submit leave applications'
      ];
    } else {
      message = 'You need to improve in some areas to become eligible.';
      if (!quizPassed) {
        suggestions.push('Quiz score below 60% - Review theoretical concepts');
      }
      if (!codingPassed) {
        suggestions.push('Coding average below 50% - Practice more DSA problems');
      }
      if (!challengesPassed) {
        suggestions.push('Complete more coding challenges successfully');
      }
    }
    
    setEligibility({
      isEligible,
      message,
      suggestions,
      quizPassed,
      codingPassed,
      challengesPassed
    });

    // Store eligibility in localStorage for leave workflow
    localStorage.setItem('leaveEligibility', JSON.stringify({
      isEligible,
      finalScore,
      quizScore,
      codingScore: avgCodingScore,
      timestamp: new Date().toISOString()
    }));
  };

  if (!eligibility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating results...</p>
        </div>
      </div>
    );
  }

  const quizScore = quizAttempt.percentage;
  const codingScores = codingSubmissions.map(s => s.score);
  const avgCodingScore = (codingScores.reduce((a, b) => a + b, 0) / codingScores.length).toFixed(1);
  const passedCoding = codingSubmissions.filter(s => s.passed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Final Evaluation Report
          </h1>
          <button
            onClick={() => navigate('/student/quizzes')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
        </div>

        {/* Eligibility Status Card */}
        <div className={`rounded-2xl shadow-xl p-8 mb-8 text-white ${
          eligibility.isEligible 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}>
          <div className="text-center mb-6">
            {eligibility.isEligible ? (
              <CheckCircle className="w-24 h-24 mx-auto mb-4" />
            ) : (
              <XCircle className="w-24 h-24 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold mb-2">Leave Application Eligibility</h2>
            <p className="text-xl opacity-90">{eligibility.message}</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Final Score</p>
                <p className="text-4xl font-bold">{finalScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Quiz Component</p>
                <p className="text-4xl font-bold">{quizScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Coding Component</p>
                <p className="text-4xl font-bold">{avgCodingScore}%</p>
              </div>
            </div>
            
            <div className="text-sm opacity-90 text-center">
              Final Score = (Quiz × 60%) + (Coding × 40%)
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quiz Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quiz Performance</h3>
                <p className="text-sm text-gray-600">Theoretical Knowledge Assessment</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Score Achieved</span>
                <span className={`text-2xl font-bold ${quizScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                  {quizScore}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Passing Threshold</span>
                <span className="text-2xl font-bold text-gray-900">60%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Status</span>
                <span className={`px-4 py-2 rounded-full font-semibold ${
                  eligibility.quizPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {eligibility.quizPassed ? 'Passed ✓' : 'Failed ✗'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Correct Answers</span>
                <span className="text-2xl font-bold text-gray-900">
                  {quizAttempt.earnedPoints}/{quizAttempt.totalPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Coding Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Coding Performance</h3>
                <p className="text-sm text-gray-600">Practical Skills Assessment</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Average Score</span>
                <span className={`text-2xl font-bold ${avgCodingScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {avgCodingScore}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Passing Threshold</span>
                <span className="text-2xl font-bold text-gray-900">50%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Status</span>
                <span className={`px-4 py-2 rounded-full font-semibold ${
                  eligibility.codingPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {eligibility.codingPassed ? 'Passed ✓' : 'Failed ✗'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Challenges Passed</span>
                <span className="text-2xl font-bold text-gray-900">
                  {passedCoding}/{codingSubmissions.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Difficulty Level</span>
                <span className={`px-4 py-2 rounded-full font-semibold ${
                  difficultyLevel === 'Advanced' ? 'bg-purple-100 text-purple-700' :
                  difficultyLevel === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {difficultyLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coding Challenge Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Coding Challenge Details</h3>
          <div className="space-y-3">
            {codingSubmissions.map((submission, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${
                submission.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {submission.passed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Challenge {idx + 1}</p>
                      <p className="text-sm text-gray-600">Language: {submission.language}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{submission.score}%</p>
                    <p className="text-sm text-gray-600">{submission.passed ? 'Passed' : 'Failed'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Assessment Comparison */}
        {skillAssessment && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Self-Assessment Accuracy</h3>
                <p className="text-sm text-gray-600">How well did you know yourself?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border-2 border-indigo-200">
                <h4 className="font-bold text-gray-900 mb-4">Your Initial Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">DSA Rating:</span>
                    <span className="text-xl font-bold text-gray-900">{skillAssessment.ratings.DSA}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Predicted Level:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      {difficultyLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                <h4 className="font-bold text-gray-900 mb-4">Actual Performance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Coding Score:</span>
                    <span className="text-xl font-bold text-gray-900">{avgCodingScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Combined Score:</span>
                    <span className="text-xl font-bold text-gray-900">{finalScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {eligibility.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-700">
                <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/student/quizzes')}
            className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Back to Quizzes
          </button>
          
          {eligibility.isEligible && (
            <button
              onClick={() => navigate('/student/apply-leave')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-6 h-6" />
              Apply for Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalEvaluation;
