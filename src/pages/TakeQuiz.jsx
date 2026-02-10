import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { quizAPI } from '../utils/api';
import { Clock, AlertCircle, CheckCircle, ArrowLeft, Brain } from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [originalQuiz, setOriginalQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(new Date());
  const [hasAttempted, setHasAttempted] = useState(false);
  const [skillAssessment, setSkillAssessment] = useState(null);
  const [isAdaptive, setIsAdaptive] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, timeLeft]);

  // Adaptive question selection based on skill assessment
  const selectAdaptiveQuestions = (allQuestions, assessment) => {
    if (!assessment || allQuestions.length <= 10) {
      return allQuestions; // Return all if no assessment or too few questions
    }

    const { level } = assessment;
    
    // Categorize questions by difficulty (we'll use a heuristic based on question structure)
    const categorizeQuestion = (q) => {
      // If question has explicit difficulty, use it
      if (q.difficulty) return q.difficulty;
      
      // Otherwise, categorize based on complexity heuristics
      if (isCodingQuestion(q)) return 'Hard';
      if (q.options && q.options.length > 4) return 'Medium';
      return 'Easy';
    };

    const categorized = {
      Easy: allQuestions.filter(q => categorizeQuestion(q) === 'Easy'),
      Medium: allQuestions.filter(q => categorizeQuestion(q) === 'Medium'),
      Hard: allQuestions.filter(q => categorizeQuestion(q) === 'Hard')
    };

    let selectedQuestions = [];
    const totalToSelect = Math.min(15, allQuestions.length); // Cap at 15 questions

    if (level === 'Advanced') {
      // 70% Hard, 20% Medium, 10% Easy
      const hardCount = Math.floor(totalToSelect * 0.7);
      const mediumCount = Math.floor(totalToSelect * 0.2);
      const easyCount = totalToSelect - hardCount - mediumCount;

      selectedQuestions = [
        ...getRandomQuestions(categorized.Hard, hardCount),
        ...getRandomQuestions(categorized.Medium, mediumCount),
        ...getRandomQuestions(categorized.Easy, easyCount)
      ];
    } else if (level === 'Intermediate') {
      // 60% Medium, 20% Hard, 20% Easy
      const mediumCount = Math.floor(totalToSelect * 0.6);
      const hardCount = Math.floor(totalToSelect * 0.2);
      const easyCount = totalToSelect - mediumCount - hardCount;

      selectedQuestions = [
        ...getRandomQuestions(categorized.Medium, mediumCount),
        ...getRandomQuestions(categorized.Hard, hardCount),
        ...getRandomQuestions(categorized.Easy, easyCount)
      ];
    } else {
      // Beginner: 70% Easy, 20% Medium, 10% Hard
      const easyCount = Math.floor(totalToSelect * 0.7);
      const mediumCount = Math.floor(totalToSelect * 0.2);
      const hardCount = totalToSelect - easyCount - mediumCount;

      selectedQuestions = [
        ...getRandomQuestions(categorized.Easy, easyCount),
        ...getRandomQuestions(categorized.Medium, mediumCount),
        ...getRandomQuestions(categorized.Hard, hardCount)
      ];
    }

    // Shuffle to avoid predictable patterns
    return shuffleArray(selectedQuestions);
  };

  const getRandomQuestions = (questions, count) => {
    if (!questions || questions.length === 0) return [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuiz = async () => {
    try {
      setLoading(true);

      // Validate quiz ID exists
      if (!id || id === 'undefined') {
        alert('Invalid quiz ID. Redirecting to quiz list...');
        navigate('/student/quizzes');
        return;
      }

      const response = await quizAPI.getQuiz(id);
      
      console.log('Quiz response:', response.data);
      console.log('Quiz questions:', response.data.quiz?.questions);
      
      if (response.data.hasAttempted) {
        setHasAttempted(true);
        alert('You have already attempted this quiz!');
        navigate('/student/quizzes');
        return;
      }

      const fetchedQuiz = response.data.quiz;
      setOriginalQuiz(fetchedQuiz);

      // Check for skill assessment from navigation state or localStorage
      let assessment = location.state?.skillAssessment;
      if (!assessment) {
        const stored = localStorage.getItem('skillAssessment');
        if (stored) {
          assessment = JSON.parse(stored);
        }
      }

      if (assessment && fetchedQuiz.questions.length > 10) {
        // Apply adaptive selection
        const adaptedQuestions = selectAdaptiveQuestions(fetchedQuiz.questions, assessment);
        setQuiz({
          ...fetchedQuiz,
          questions: adaptedQuestions
        });
        setSkillAssessment(assessment);
        setIsAdaptive(true);
        
        // Store assessment data for results comparison
        localStorage.setItem('currentQuizAssessment', JSON.stringify({
          quizId: id,
          assessment,
          adaptedQuestionCount: adaptedQuestions.length,
          originalQuestionCount: fetchedQuiz.questions.length
        }));
      } else {
        setQuiz(fetchedQuiz);
        setIsAdaptive(false);
      }

      setTimeLeft(fetchedQuiz.duration * 60); // Convert to seconds
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error loading quiz. Please try again.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: 'mcq', selectedAnswer: answerIndex },
    }));
  };

  const handleCodeChange = (questionId, code) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { type: 'coding', language: prev?.[questionId]?.language || 'JavaScript', code },
    }));
  };

  const handleLanguageChange = (questionId, language) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev?.[questionId] || {}), type: 'coding', language },
    }));
  };

  const handleSubmit = async () => {

    // Check if all questions are answered (MCQ must have selectedAnswer, coding must have non-empty code)
    const unanswered = quiz.questions.filter((q) => {
      const a = answers[q._id];
      if (!a) return true;
      if (a.type === 'mcq') return a.selectedAnswer === undefined || a.selectedAnswer === -1;
      if (a.type === 'coding') return !a.code || a.code.trim().length === 0;
      return true;
    });

    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);

      // Prepare answers in required format - support MCQ and coding
      const formattedAnswers = quiz.questions.map((q) => {
        const a = answers[q._id];
        if (!a) {
          // unanswered
          return q.options && q.options.length > 0
            ? { questionId: q._id, type: 'mcq', selectedAnswer: -1 }
            : { questionId: q._id, type: 'coding', language: 'JavaScript', code: '' };
        }

        if (a.type === 'mcq') {
          return { questionId: q._id, type: 'mcq', selectedAnswer: a.selectedAnswer ?? -1 };
        }

        if (a.type === 'coding') {
          return { questionId: q._id, type: 'coding', language: a.language || 'JavaScript', code: a.code || '' };
        }

        // fallback
        return { questionId: q._id, type: 'mcq', selectedAnswer: -1 };
      });

      const response = await quizAPI.submitQuiz(id, {
        answers: formattedAnswers,
        startedAt: startedAt.toISOString(),
      });

      // Show result
      alert(response.data.message);
      
      // Navigate to results
      navigate(`/student/quiz/${id}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert(error.response?.data?.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodingQuestion = (question) => {
    if (!question) return false;
    // Explicit type marker
    if (question.type === 'coding') return true;
    if (question.type === 'mcq') return false;
    // If options missing or empty, treat as coding
    if (!question.options || question.options.length === 0) return true;
    // If starterCode present, it's coding
    if (question.starterCode) return true;
    return false;
  };

  const getAnsweredCount = () => {
    // Count only meaningful answers: MCQ selectedAnswer !== -1, coding has non-empty code
    return Object.values(answers).filter((a) => {
      if (!a) return false;
      if (a.type === 'mcq') return a.selectedAnswer !== undefined && a.selectedAnswer !== -1;
      if (a.type === 'coding') return a.code && a.code.trim().length > 0;
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (hasAttempted || !quiz) {
    return null;
  }

  console.log('Rendering quiz:', quiz);
  console.log('Quiz questions count:', quiz.questions?.length);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Adaptive Quiz Indicator */}
        {isAdaptive && skillAssessment && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-bold">Adaptive Quiz Mode</h3>
                <p className="text-sm opacity-90">
                  Questions personalized for {skillAssessment.level} level (Self-rated: {skillAssessment.avgRating}/5)
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 text-center">
                <p className="text-xs opacity-90">Adapted</p>
                <p className="text-xl font-bold">{quiz.questions.length}</p>
                <p className="text-xs opacity-90">questions</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
            </div>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`} />
              <span className={`font-semibold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">
                {getAnsweredCount()} / {quiz.questions.length} answered
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Important:</span> You can only attempt this quiz once. 
                Make sure to answer all questions carefully before submitting.
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    answers[question._id] !== undefined 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {question.question}
                  </h3>

                  <div className="space-y-3">
                    {!isCodingQuestion(question) ? (
                      // Multiple choice
                      question.options.map((option, optionIndex) => {
                        const selected = answers[question._id]?.type === 'mcq' && answers[question._id]?.selectedAnswer === optionIndex;
                        return (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(question._id, optionIndex)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {selected && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className={
                                selected
                                  ? 'text-blue-900 font-medium'
                                  : 'text-gray-700'
                              }>
                                {option}
                              </span>
                            </div>
                          </button>
                        );
                      })
                      ) : (
                      // Coding Question
                      <div className="space-y-4 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-blue-200">
                        {/* Coding Question Header */}
                        <div className="flex items-center gap-2 pb-3 border-b border-blue-200">
                          <div className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                            💻 CODING QUESTION
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Write your solution below
                          </div>
                        </div>

                        {/* Starter Code (if exists) */}
                        {question.starterCode && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              📄 Starter Code Template:
                              <span className="text-xs text-gray-500 font-normal">(You can modify this)</span>
                            </label>
                            <div className="bg-gray-800 text-green-300 font-mono text-sm p-4 rounded-lg border-2 border-gray-700 overflow-auto max-h-48">
                              <pre className="whitespace-pre-wrap">{question.starterCode}</pre>
                            </div>
                          </div>
                        )}

                        {/* Language Selector */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            🔧 Programming Language:
                          </label>
                          <select
                            value={answers[question._id]?.language || 'JavaScript'}
                            onChange={(e) => handleLanguageChange(question._id, e.target.value)}
                            className="w-full md:w-64 px-4 py-3 border-2 border-blue-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-medium"
                          >
                            <option value="JavaScript">JavaScript</option>
                            <option value="Python">Python</option>
                            <option value="Java">Java</option>
                            <option value="C++">C++</option>
                            <option value="C">C</option>
                            <option value="Ruby">Ruby</option>
                            <option value="Go">Go</option>
                          </select>
                        </div>

                        {/* Code Editor */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                            <span>✍️ Write Your Solution:</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              answers[question._id]?.code?.trim() 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {answers[question._id]?.code?.trim() ? '✓ Code Written' : '⚠ Not Yet Answered'}
                            </span>
                          </label>
                          <textarea
                            value={answers[question._id]?.code || ''}
                            onChange={(e) => handleCodeChange(question._id, e.target.value)}
                            rows={15}
                            className="w-full font-mono text-sm p-4 border-2 border-blue-300 rounded-lg bg-gray-900 text-green-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            placeholder={`// Write your ${answers[question._id]?.language || 'JavaScript'} solution here...\n\n// Example:\nfunction solution() {\n    // Your code\n}`}
                            spellCheck="false"
                          />
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>💡 Tip: Write clean, well-commented code for better evaluation</span>
                          </div>
                        </div>

                        {/* Question Metadata (Collapsible) */}
                        <details className="text-xs text-gray-600 mt-2 bg-white p-3 rounded border border-gray-200">
                          <summary className="cursor-pointer font-medium hover:text-blue-600 transition">
                            🔍 Show Question Details
                          </summary>
                          <pre className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto border border-gray-200">{JSON.stringify(question, null, 2)}</pre>
                        </details>
                      </div>
                    )}
                  </div>

                  {question.points > 1 && (
                    <p className="text-sm text-gray-500 mt-3">
                      Worth {question.points} points
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {getAnsweredCount()} of {quiz.questions.length} questions answered
              </p>
              {getAnsweredCount() < quiz.questions.length && (
                <p className="text-sm text-yellow-600 mt-1">
                  {quiz.questions.length - getAnsweredCount()} questions remaining
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
