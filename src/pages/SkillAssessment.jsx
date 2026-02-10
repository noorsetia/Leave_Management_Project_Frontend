import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Star, ArrowRight, TrendingUp, Zap, Award } from 'lucide-react';

const SkillAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId, quizTitle } = location.state || {};

  const [ratings, setRatings] = useState({
    HTML: 0,
    CSS: 0,
    JavaScript: 0,
    React: 0,
    Backend: 0,
    DSA: 0
  });

  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(null);

  const skillDescriptions = {
    HTML: 'Markup language for web structure',
    CSS: 'Styling and layout of web pages',
    JavaScript: 'Programming language for web interactivity',
    React: 'JavaScript library for building UIs',
    Backend: 'Server-side development and APIs',
    DSA: 'Data Structures and Algorithms'
  };

  const ratingLabels = {
    0: 'No Knowledge',
    1: 'Beginner',
    2: 'Learning',
    3: 'Comfortable',
    4: 'Proficient',
    5: 'Expert'
  };

  // Map rating to difficulty level
  const getDifficultyFromRating = (rating) => {
    if (rating >= 1 && rating <= 2) return 'Easy';
    if (rating === 3) return 'Medium';
    if (rating >= 4) return 'Hard';
    return null;
  };

  // Get selected topics (rated > 0)
  const getSelectedTopics = () => {
    return Object.keys(ratings).filter(skill => ratings[skill] > 0);
  };

  // Get topic-to-difficulty mapping
  const getTopicDifficultyMap = () => {
    const selectedTopics = getSelectedTopics();
    return selectedTopics.reduce((map, topic) => {
      map[topic] = getDifficultyFromRating(ratings[topic]);
      return map;
    }, {});
  };

  const handleRatingChange = (skill, rating) => {
    setRatings(prev => ({ ...prev, [skill]: rating }));
  };

  const calculateSkillLevel = () => {
    const ratingValues = Object.values(ratings);
    const totalRatings = ratingValues.filter(r => r > 0).length;
    
    if (totalRatings === 0) {
      return { level: 'Beginner', avgRating: 0 };
    }

    const avgRating = ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length;

    let level;
    if (avgRating >= 4) {
      level = 'Advanced';
    } else if (avgRating >= 2.5) {
      level = 'Intermediate';
    } else {
      level = 'Beginner';
    }

    return { level, avgRating: avgRating.toFixed(1) };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that at least one rating is selected
    const hasRatings = Object.values(ratings).some(r => r > 0);
    if (!hasRatings) {
      alert('Please rate your skills in at least one area to continue');
      return;
    }

    const { level, avgRating } = calculateSkillLevel();
    const selectedTopics = getSelectedTopics();
    const topicDifficultyMap = getTopicDifficultyMap();

    // Store comprehensive skill assessment
    const skillAssessment = {
      ratings,
      level,
      avgRating,
      selectedTopics,
      topicDifficultyMap,
      ratedSkills: selectedTopics,
      timestamp: new Date().toISOString()
    };

    console.log('Skill Assessment:', skillAssessment);
    console.log('Selected Topics:', selectedTopics);
    console.log('Topic Difficulty Map:', topicDifficultyMap);

    localStorage.setItem('skillAssessment', JSON.stringify(skillAssessment));

    // Navigate to adaptive quiz list filtered by selected topics
    navigate('/student/quizzes', {
      state: {
        skillAssessment,
        fromAssessment: true,
        filterByTopics: true
      }
    });
  };

  const hasAnyRating = Object.values(ratings).some(r => r > 0);
  const ratedCount = Object.values(ratings).filter(r => r > 0).length;
  const { level, avgRating } = calculateSkillLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skill Assessment</h1>
              <p className="text-gray-600 mt-1">Help us personalize your quiz experience</p>
            </div>
          </div>

          {quizTitle ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Taking Quiz:</span> {quizTitle}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> No quiz selected. You can still explore the skill assessment, but you'll need to select a quiz from the quiz list to continue.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">How This Works</h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Rate your current knowledge level in areas you know (1-5 stars) - skip any you're unfamiliar with</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>We'll calculate your overall skill level based on rated areas (Beginner/Intermediate/Advanced)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Your quiz will be adapted with questions matching your level - at least one rating required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skill Rating Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Rate Your Skills
            </h2>

            <div className="space-y-6">
              {Object.keys(ratings).map((skill) => (
                <div
                  key={skill}
                  className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  onMouseLeave={() => {
                    setHoveredSkill(null);
                    setHoveredRating(null);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{skill}</h3>
                      <p className="text-sm text-gray-500">{skillDescriptions[skill]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ratings[skill] > 0 ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                          {ratingLabels[ratings[skill]]} - {getDifficultyFromRating(ratings[skill])}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-semibold rounded-full">
                          Not Selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating with 0 option */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRatingChange(skill, 0)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          ratings[skill] === 0
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Skip / No Knowledge
                      </button>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const isSelected = ratings[skill] >= rating;
                      const isHovered = hoveredSkill === skill && hoveredRating >= rating;
                      const shouldHighlight = isSelected || isHovered;

                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingChange(skill, rating)}
                          onMouseEnter={() => {
                            setHoveredSkill(skill);
                            setHoveredRating(rating);
                          }}
                          className="group relative transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 transition-all ${
                              shouldHighlight
                            }`}
                          />
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {ratingLabels[rating]}
                          </span>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Summary */}
          {Object.values(ratings).some(r => r > 0) && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Your Assessment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Skill Level</p>
                  <p className="text-3xl font-bold text-blue-600">{level}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold text-indigo-600">{avgRating} / 5.0</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Skills Rated</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {ratedCount} / 6
                  </p>
                  {ratedCount < 6 && (
                    <p className="text-xs text-gray-500 mt-1">Optional: Rate more for better accuracy</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm font-semibold text-gray-800 mb-2">What This Means:</p>
                <p className="text-sm text-gray-700">
                  {level === 'Advanced' && 
                    'Your quiz will include mostly advanced questions with some intermediate challenges to keep you engaged.'}
                  {level === 'Intermediate' && 
                    'Your quiz will focus on intermediate questions with a mix of beginner and advanced problems for balanced learning.'}
                  {level === 'Beginner' && 
                    'Your quiz will include mostly beginner-friendly questions with some intermediate challenges to help you grow.'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/student/quizzes')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!hasAnyRating}
              className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                hasAnyRating
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasAnyRating ? (
                <>
                  Start Adaptive Quiz
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Rate at least one skill to continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillAssessment;
