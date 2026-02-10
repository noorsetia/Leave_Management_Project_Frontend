import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code, Play, Send, CheckCircle, XCircle, Clock, Award, Zap, TrendingUp, ArrowLeft, Lightbulb, AlertCircle } from 'lucide-react';

const CodingChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizAttempt, skillAssessment } = location.state || {};

  const [challenges, setChallenges] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');

  useEffect(() => {
    // Redirect if no quiz attempt data
    if (!quizAttempt || !skillAssessment) {
      alert('Please complete the quiz first');
      navigate('/student/quizzes');
      return;
    }

    // Calculate coding difficulty based on DSA rating and quiz performance
    const difficulty = calculateCodingDifficulty();
    setDifficultyLevel(difficulty);

    // Generate coding challenges based on difficulty
    const generatedChallenges = generateChallenges(difficulty);
    setChallenges(generatedChallenges);
    setCode(generatedChallenges[0]?.starterCode || '');
  }, []);

  const calculateCodingDifficulty = () => {
    const dsaRating = skillAssessment?.ratings?.DSA || 1;
    const quizScore = quizAttempt?.percentage || 0;

    // Base difficulty on DSA rating
    let difficulty;
    if (dsaRating <= 2) {
      difficulty = 'Beginner';
    } else if (dsaRating === 3) {
      difficulty = 'Intermediate';
    } else {
      difficulty = 'Advanced';
    }

    // Auto-adjust if quiz performance differs significantly from self-rating
    const expectedScore = dsaRating * 20; // Convert 1-5 to 20-100 scale
    const scoreDifference = quizScore - expectedScore;

    if (Math.abs(scoreDifference) >= 20) {
      if (scoreDifference > 0 && difficulty === 'Beginner') {
        // Performed much better than self-rated
        difficulty = 'Intermediate';
      } else if (scoreDifference < 0 && difficulty === 'Advanced') {
        // Performed worse than self-rated
        difficulty = 'Intermediate';
      }
    }

    return difficulty;
  };

  const generateChallenges = (difficulty) => {
    const challengeBank = {
      Beginner: [
        {
          id: 'beginner-1',
          title: 'Sum of Two Numbers',
          description: 'Write a function that takes two numbers as input and returns their sum.',
          inputDescription: 'Two integers a and b',
          outputDescription: 'The sum of a and b',
          constraints: '-1000 ≤ a, b ≤ 1000',
          sampleTests: [
            { input: [5, 3], expectedOutput: 8, description: 'sum(5, 3)' },
            { input: [-2, 7], expectedOutput: 5, description: 'sum(-2, 7)' },
            { input: [0, 0], expectedOutput: 0, description: 'sum(0, 0)' }
          ],
          hiddenTests: [
            { input: [100, -50], expectedOutput: 50 },
            { input: [-999, -1], expectedOutput: -1000 },
            { input: [500, 500], expectedOutput: 1000 }
          ],
          starterCode: {
            javascript: 'function sum(a, b) {\n  // Write your code here\n  \n}',
            python: 'def sum(a, b):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static int sum(int a, int b) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Easy'
        },
        {
          id: 'beginner-2',
          title: 'Reverse a String',
          description: 'Write a function that reverses a given string.',
          inputDescription: 'A string s',
          outputDescription: 'The reversed string',
          constraints: '1 ≤ length of s ≤ 1000',
          sampleTests: [
            { input: ['hello'], expectedOutput: 'olleh', description: 'reverse("hello")' },
            { input: ['world'], expectedOutput: 'dlrow', description: 'reverse("world")' },
            { input: ['a'], expectedOutput: 'a', description: 'reverse("a")' }
          ],
          hiddenTests: [
            { input: ['JavaScript'], expectedOutput: 'tpircSavaJ' },
            { input: ['12345'], expectedOutput: '54321' },
            { input: ['racecar'], expectedOutput: 'racecar' }
          ],
          starterCode: {
            javascript: 'function reverse(s) {\n  // Write your code here\n  \n}',
            python: 'def reverse(s):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static String reverse(String s) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Easy'
        }
      ],
      Intermediate: [
        {
          id: 'intermediate-1',
          title: 'Find Duplicates in Array',
          description: 'Write a function that finds all duplicate elements in an array and returns them in ascending order.',
          inputDescription: 'An array of integers',
          outputDescription: 'Array of duplicate elements in ascending order',
          constraints: '1 ≤ array length ≤ 1000, 0 ≤ elements ≤ 1000',
          sampleTests: [
            { input: [[1, 2, 3, 2, 4, 3]], expectedOutput: [2, 3], description: 'findDuplicates([1,2,3,2,4,3])' },
            { input: [[5, 5, 5, 5]], expectedOutput: [5], description: 'findDuplicates([5,5,5,5])' },
            { input: [[1, 2, 3, 4]], expectedOutput: [], description: 'findDuplicates([1,2,3,4])' }
          ],
          hiddenTests: [
            { input: [[10, 20, 10, 30, 20, 40]], expectedOutput: [10, 20] },
            { input: [[1]], expectedOutput: [] },
            { input: [[7, 7, 8, 8, 9, 9]], expectedOutput: [7, 8, 9] }
          ],
          starterCode: {
            javascript: 'function findDuplicates(arr) {\n  // Write your code here\n  \n}',
            python: 'def find_duplicates(arr):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static int[] findDuplicates(int[] arr) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Medium'
        },
        {
          id: 'intermediate-2',
          title: 'Valid Palindrome',
          description: 'Determine if a string is a palindrome, considering only alphanumeric characters and ignoring case.',
          inputDescription: 'A string s',
          outputDescription: 'true if palindrome, false otherwise',
          constraints: '1 ≤ length of s ≤ 1000',
          sampleTests: [
            { input: ['A man, a plan, a canal: Panama'], expectedOutput: true, description: 'isPalindrome("A man, a plan, a canal: Panama")' },
            { input: ['race a car'], expectedOutput: false, description: 'isPalindrome("race a car")' },
            { input: [''], expectedOutput: true, description: 'isPalindrome("")' }
          ],
          hiddenTests: [
            { input: ['Madam'], expectedOutput: true },
            { input: ['hello'], expectedOutput: false },
            { input: ['12321'], expectedOutput: true }
          ],
          starterCode: {
            javascript: 'function isPalindrome(s) {\n  // Write your code here\n  \n}',
            python: 'def is_palindrome(s):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Medium'
        }
      ],
      Advanced: [
        {
          id: 'advanced-1',
          title: 'Longest Substring Without Repeating Characters',
          description: 'Find the length of the longest substring without repeating characters.',
          inputDescription: 'A string s',
          outputDescription: 'Length of the longest substring without repeating characters',
          constraints: '0 ≤ length of s ≤ 50000',
          sampleTests: [
            { input: ['abcabcbb'], expectedOutput: 3, description: 'lengthOfLongestSubstring("abcabcbb") // "abc"' },
            { input: ['bbbbb'], expectedOutput: 1, description: 'lengthOfLongestSubstring("bbbbb") // "b"' },
            { input: ['pwwkew'], expectedOutput: 3, description: 'lengthOfLongestSubstring("pwwkew") // "wke"' }
          ],
          hiddenTests: [
            { input: [''], expectedOutput: 0 },
            { input: ['abcdef'], expectedOutput: 6 },
            { input: ['aab'], expectedOutput: 2 }
          ],
          starterCode: {
            javascript: 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}',
            python: 'def length_of_longest_substring(s):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Hard'
        },
        {
          id: 'advanced-2',
          title: 'Merge Intervals',
          description: 'Given an array of intervals, merge all overlapping intervals.',
          inputDescription: 'Array of intervals [[start1, end1], [start2, end2], ...]',
          outputDescription: 'Array of merged intervals',
          constraints: '1 ≤ intervals.length ≤ 1000',
          sampleTests: [
            { input: [[[1,3],[2,6],[8,10],[15,18]]], expectedOutput: [[1,6],[8,10],[15,18]], description: 'merge([[1,3],[2,6],[8,10],[15,18]])' },
            { input: [[[1,4],[4,5]]], expectedOutput: [[1,5]], description: 'merge([[1,4],[4,5]])' }
          ],
          hiddenTests: [
            { input: [[[1,4],[2,3]]], expectedOutput: [[1,4]] },
            { input: [[[1,10],[2,6],[8,9]]], expectedOutput: [[1,10]] }
          ],
          starterCode: {
            javascript: 'function merge(intervals) {\n  // Write your code here\n  \n}',
            python: 'def merge(intervals):\n    # Write your code here\n    pass',
            java: 'public class Solution {\n    public static int[][] merge(int[][] intervals) {\n        // Write your code here\n        \n    }\n}'
          },
          difficulty: 'Hard'
        }
      ]
    };

    return challengeBank[difficulty] || challengeBank.Beginner;
  };

  const currentChallenge = challenges[currentChallengeIndex];

  useEffect(() => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode[language] || '');
      setTestResults(null);
    }
  }, [currentChallengeIndex, language, currentChallenge]);

  const executeCode = (tests, isFullSubmission = false) => {
    // Simple code execution simulation
    // In a real app, this would call a backend code execution service
    
    try {
      const results = tests.map(test => {
        try {
          // Create a safe execution context
          let result;
          
          if (language === 'javascript') {
            // Extract function name from code
            const funcMatch = code.match(/function\s+(\w+)/);
            if (!funcMatch) {
              throw new Error('No function found in code');
            }
            const funcName = funcMatch[1];
            
            // Execute code in isolated context
            const func = new Function('return ' + code)();
            result = func(...test.input);
          }
          
          const passed = JSON.stringify(result) === JSON.stringify(test.expectedOutput);
          
          return {
            passed,
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: result,
            description: test.description || `Test ${tests.indexOf(test) + 1}`
          };
        } catch (error) {
          return {
            passed: false,
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: error.message,
            error: error.message,
            description: test.description || `Test ${tests.indexOf(test) + 1}`
          };
        }
      });

      return results;
    } catch (error) {
      return [{
        passed: false,
        error: error.message,
        description: 'Execution Error'
      }];
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTestResults(null);

    setTimeout(() => {
      const results = executeCode(currentChallenge.sampleTests, false);
      setTestResults({
        type: 'sample',
        results,
        passed: results.every(r => r.passed),
        totalTests: results.length,
        passedTests: results.filter(r => r.passed).length
      });
      setIsRunning(false);
    }, 1000);
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setTestResults(null);

    setTimeout(() => {
      const allTests = [...currentChallenge.sampleTests, ...currentChallenge.hiddenTests];
      const results = executeCode(allTests, true);
      const passed = results.every(r => r.passed);
      const passedCount = results.filter(r => r.passed).length;
      const score = (passedCount / allTests.length) * 100;

      setTestResults({
        type: 'full',
        results,
        passed,
        totalTests: allTests.length,
        passedTests: passedCount,
        score: Math.round(score)
      });

      // Store submission
      const submission = {
        challengeId: currentChallenge.id,
        code,
        language,
        passed,
        score: Math.round(score),
        timestamp: new Date().toISOString()
      };
      
      setSubmissions(prev => [...prev, submission]);

      // Check if all challenges completed
      if (currentChallengeIndex === challenges.length - 1 && passed) {
        setAllCompleted(true);
      }

      setIsSubmitting(false);
    }, 1500);
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setTestResults(null);
    }
  };

  const handleViewResults = () => {
    // Calculate final scores
    const quizScore = quizAttempt.percentage;
    const codingScores = submissions.map(s => s.score);
    const avgCodingScore = codingScores.length > 0 
      ? codingScores.reduce((a, b) => a + b, 0) / codingScores.length 
      : 0;
    
    const finalScore = (quizScore * 0.6) + (avgCodingScore * 0.4); // 60% quiz, 40% coding

    navigate('/student/final-evaluation', {
      state: {
        quizAttempt,
        skillAssessment,
        codingSubmissions: submissions,
        finalScore: Math.round(finalScore),
        difficultyLevel
      }
    });
  };

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coding Challenge</h1>
                <p className="text-gray-600">Difficulty: <span className="font-semibold text-blue-600">{difficultyLevel}</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Challenge {currentChallengeIndex + 1} of {challenges.length}</span>
                <span>{submissions.filter(s => s.passed).length} / {challenges.length} Completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentChallengeIndex + 1) / challenges.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Problem Statement */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentChallenge.title}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{currentChallenge.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Input</h3>
                <p className="text-gray-700">{currentChallenge.inputDescription}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Output</h3>
                <p className="text-gray-700">{currentChallenge.outputDescription}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Constraints</h3>
                <p className="text-gray-700 font-mono text-sm bg-gray-50 p-3 rounded">{currentChallenge.constraints}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sample Test Cases</h3>
                <div className="space-y-3">
                  {currentChallenge.sampleTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-mono text-gray-700 mb-1">{test.description}</p>
                      <p className="text-sm text-gray-600">Expected: <span className="font-semibold">{JSON.stringify(test.expectedOutput)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Code Editor</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your code here..."
                spellCheck={false}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults && (
              <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                testResults.passed ? 'border-green-400' : 'border-red-400'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {testResults.passed ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        All Tests Passed!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600" />
                        Some Tests Failed
                      </>
                    )}
                  </h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {testResults.passedTests} / {testResults.totalTests} Passed
                  </span>
                </div>

                {testResults.type === 'full' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">Score: {testResults.score}%</p>
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {testResults.results.slice(0, testResults.type === 'sample' ? undefined : 3).map((result, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 ${
                      result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{result.description}</span>
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      {!result.passed && (
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Expected: {JSON.stringify(result.expectedOutput)}</p>
                          <p>Got: {JSON.stringify(result.actualOutput)}</p>
                          {result.error && <p className="text-red-600">Error: {result.error}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {testResults.type === 'full' && testResults.passed && (
                  <div className="mt-4 flex gap-3">
                    {currentChallengeIndex < challenges.length - 1 ? (
                      <button
                        onClick={handleNextChallenge}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Next Challenge →
                      </button>
                    ) : (
                      <button
                        onClick={handleViewResults}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Award className="w-5 h-5" />
                        View Final Results
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {allCompleted && !testResults && (
              <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Award className="w-8 h-8" />
                  All Challenges Completed!
                </h3>
                <p className="mb-4">Congratulations! You've completed all coding challenges.</p>
                <button
                  onClick={handleViewResults}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  View Final Evaluation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge;
