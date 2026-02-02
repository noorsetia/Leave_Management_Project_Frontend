import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../utils/api';
import { Sparkles, Code, Brain, BookOpen, Zap, CheckCircle, XCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const GenerateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Config, 2: Generating, 3: Review
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [config, setConfig] = useState({
    topic: '',
    category: 'General',
    class: 'BCA 2nd Year',
    subject: '',
    difficulty: 'Medium',
    numMCQ: 10,
    numCoding: 5,
    duration: 30,
    passingScore: 70,
    title: '',
    description: ''
  });

  const categories = ['General', 'DSA', 'Web Development', 'Database', 'Programming'];
  const classes = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year', 'MCA 1st Year', 'MCA 2nd Year'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleGenerateQuiz = async () => {
    if (!config.topic || !config.subject) {
      alert('Please fill in Topic and Subject fields!');
      return;
    }

    try {
      setLoading(true);
      setStep(2);

      const questions = [];

      // Generate MCQ Questions
      if (config.numMCQ > 0) {
        const mcqResponse = await quizAPI.generateQuestions(
          config.topic,
          config.difficulty,
          config.numMCQ
        );
        questions.push(...mcqResponse.data.questions);
      }

      // Generate Coding Questions
      if (config.numCoding > 0) {
        for (let i = 0; i < config.numCoding; i++) {
          const codingResponse = await quizAPI.generateCodingQuestion(
            config.topic,
            config.difficulty,
            'JavaScript' // Default language for starter code
          );
          
          const codingQ = codingResponse.data.codingQuestion;
          questions.push({
            question: codingQ.question,
            type: 'coding',
            starterCode: codingQ.starterCode || '',
            points: config.difficulty === 'Easy' ? 15 : config.difficulty === 'Medium' ? 20 : 25
          });
        }
      }

      setGeneratedQuestions(questions);
      setStep(3);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please check your API key and try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (generatedQuestions.length === 0) {
      alert('No questions to save!');
      return;
    }

    try {
      setLoading(true);

      const quizData = {
        title: config.title || `${config.topic} - ${config.difficulty} Level Quiz`,
        description: config.description || `AI-generated quiz on ${config.topic} covering key concepts and coding challenges.`,
        category: config.category,
        class: config.class,
        subject: config.subject,
        difficulty: config.difficulty,
        duration: config.duration,
        passingScore: config.passingScore,
        questions: generatedQuestions,
        isActive: true
      };

      await quizAPI.createQuiz(quizData);
      alert('Quiz created successfully!');
      navigate('/teacher/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = (index) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setGeneratedQuestions(prev => 
      prev.map((q, i) => i === index ? { ...q, [field]: value } : q)
    );
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Quiz with AI...</h2>
          <p className="text-gray-600 mb-4">Please wait while Gemini creates your questions</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              AI Quiz Generator
            </h1>
            <p className="text-gray-600 mt-1">Create quizzes instantly with Gemini AI</p>
          </div>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Quiz Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="e.g., React Hooks, Data Structures, Python OOP"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  placeholder="e.g., Web Development, DSA, Programming"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={config.category}
                  onChange={(e) => setConfig({ ...config, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <select
                  value={config.class}
                  onChange={(e) => setConfig({ ...config, class: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                </select>
              </div>

              {/* Number of MCQ Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  MCQ Questions (0-15)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={config.numMCQ}
                  onChange={(e) => setConfig({ ...config, numMCQ: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Number of Coding Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coding Questions (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={config.numCoding}
                  onChange={(e) => setConfig({ ...config, numCoding: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={config.passingScore}
                  onChange={(e) => setConfig({ ...config, passingScore: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Title (optional)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Leave empty for auto-generated title"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Leave empty for auto-generated description"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Quiz Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-purple-600">{config.numMCQ + config.numCoding}</p>
                </div>
                <div>
                  <p className="text-gray-600">MCQ Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{config.numMCQ}</p>
                </div>
                <div>
                  <p className="text-gray-600">Coding Questions</p>
                  <p className="text-2xl font-bold text-green-600">{config.numCoding}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-orange-600">{config.duration}m</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuiz}
                disabled={loading || !config.topic || !config.subject || (config.numMCQ + config.numCoding === 0)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Quiz with AI
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Review Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Review Generated Questions
              </h2>
              <p className="text-gray-600 mb-4">
                {generatedQuestions.length} questions generated. Review and edit before saving.
              </p>
              
              <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-bold text-green-900">AI Generation Complete!</p>
                  <p className="text-sm text-green-700">
                    {generatedQuestions.filter(q => q.type !== 'coding').length} MCQ + 
                    {generatedQuestions.filter(q => q.type === 'coding').length} Coding Questions
                  </p>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          question.type === 'coding' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        }`}>
                          {question.type === 'coding' ? '💻 CODING' : '📝 MCQ'}
                        </span>
                        <span className="text-sm text-gray-600 font-semibold">
                          {question.points || 10} points
                        </span>
                      </div>
                      
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 font-medium text-gray-900"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeQuestion(index)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {question.type !== 'coding' ? (
                    <div className="space-y-2 ml-11">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            question.correctAnswer === optIndex
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {optIndex === question.correctAnswer && '✓'}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(index, 'options', newOptions);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500"
                          />
                        </div>
                      ))}
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                          <p className="text-sm text-blue-900"><strong>Explanation:</strong> {question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ml-11 space-y-3">
                      {question.starterCode && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Starter Code:</label>
                          <textarea
                            value={question.starterCode}
                            onChange={(e) => updateQuestion(index, 'starterCode', e.target.value)}
                            rows={6}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-6 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
              >
                ← Back to Config
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveQuiz}
                  disabled={loading || generatedQuestions.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQuiz;
