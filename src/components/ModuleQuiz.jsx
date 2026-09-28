import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../config/constants';
import { FaQuestionCircle, FaCheck, FaTimes, FaRedo, FaTrophy } from 'react-icons/fa';

export default function ModuleQuiz({ courseId, moduleId, moduleTitle }) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [courseId, moduleId]);

  const loadQuiz = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiBase()}/api/quizzes/${courseId}/${moduleId}`,
        {
          headers: {
            'x-user-id': user.id,
            'x-user-role': user.role || 'member'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
        setPreviousAttempts(data.previousAttempts || []);
      } else if (response.status === 404) {
        await generateQuiz();
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiBase()}/api/quizzes/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role || 'member'
          },
          body: JSON.stringify({
            course_id: courseId,
            module_id: moduleId,
            module_title: moduleTitle,
            module_description: ''
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setTaking(true);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
  };

  const submitQuiz = async () => {
    if (!user || !quiz) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await fetch(
        `${getApiBase()}/api/quizzes/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role || 'member'
          },
          body: JSON.stringify({
            quiz_id: quiz.id,
            answers: answers,
            time_taken_seconds: timeTaken
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setTaking(false);
        await loadQuiz();
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const selectAnswer = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={styles.errorContainer}>
        <FaQuestionCircle style={styles.errorIcon} />
        <p style={styles.errorText}>Quiz not available</p>
      </div>
    );
  }

  const questions = quiz.questions?.questions || [];
  const allAnswered = questions.every(q => answers[q.id]);
  const bestAttempt = previousAttempts.length > 0
    ? previousAttempts.reduce((best, attempt) =>
        attempt.score > best.score ? attempt : best
      )
    : null;

  // Show result screen
  if (result) {
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <div style={styles.resultIcon}>
            {result.passed ? (
              <FaTrophy style={{ color: '#10b981', fontSize: '64px' }} />
            ) : (
              <FaRedo style={{ color: '#f59e0b', fontSize: '64px' }} />
            )}
          </div>
          
          <h2 style={styles.resultTitle}>
            {result.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          
          <div style={styles.scoreCircle}>
            <div style={styles.scoreValue}>{result.score}%</div>
            <div style={styles.scoreLabel}>Score</div>
          </div>
          
          <div style={styles.resultStats}>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>{result.correctAnswers}</span>
              <span style={styles.resultStatLabel}>Correct</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>{result.totalQuestions - result.correctAnswers}</span>
              <span style={styles.resultStatLabel}>Incorrect</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>{result.attemptNumber}</span>
              <span style={styles.resultStatLabel}>Attempt</span>
            </div>
          </div>

          <p style={styles.resultMessage}>{result.message}</p>

          {/* Show detailed feedback */}
          <div style={styles.feedbackSection}>
            <h3 style={styles.feedbackTitle}>Detailed Feedback</h3>
            {result.feedback.map((fb, idx) => (
              <div key={fb.questionId} style={styles.feedbackItem}>
                <div style={styles.feedbackHeader}>
                  <span style={styles.feedbackQuestion}>Question {idx + 1}</span>
                  {fb.isCorrect ? (
                    <FaCheck style={{ color: '#10b981' }} />
                  ) : (
                    <FaTimes style={{ color: '#ef4444' }} />
                  )}
                </div>
                {!fb.isCorrect && (
                  <div style={styles.feedbackDetails}>
                    <p style={styles.feedbackText}>
                      Your answer: <strong>{fb.userAnswer}</strong>
                    </p>
                    <p style={styles.feedbackText}>
                      Correct answer: <strong>{fb.correctAnswer}</strong>
                    </p>
                    <p style={styles.feedbackExplanation}>{fb.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button style={styles.retryButton} onClick={startQuiz}>
            <FaRedo style={{ marginRight: '8px' }} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show quiz taking interface
  if (taking) {
    return (
      <div style={styles.container}>
        <div style={styles.quizHeader}>
          <h2 style={styles.quizTitle}>{quiz.title}</h2>
          <p style={styles.quizDescription}>{quiz.description}</p>
          <div style={styles.quizMeta}>
            <span>Passing Score: {quiz.passing_score}%</span>
            {quiz.time_limit_minutes && (
              <span>Time Limit: {quiz.time_limit_minutes} minutes</span>
            )}
          </div>
        </div>

        <div style={styles.questionsList}>
          {questions.map((question, index) => (
            <div key={question.id} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionNumber}>Question {index + 1}</span>
              </div>
              <p style={styles.questionText}>{question.question}</p>
              
              <div style={styles.optionsList}>
                {question.options.map(option => (
                  <button
                    key={option.id}
                    style={{
                      ...styles.optionButton,
                      ...(answers[question.id] === option.id ? styles.optionButtonSelected : {})
                    }}
                    onClick={() => selectAnswer(question.id, option.id)}
                  >
                    <div style={styles.optionRadio}>
                      {answers[question.id] === option.id && (
                        <div style={styles.optionRadioInner} />
                      )}
                    </div>
                    <span style={styles.optionText}>
                      <strong>{option.id}.</strong> {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.quizFooter}>
          <div style={styles.progressText}>
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          <button
            style={{
              ...styles.submitButton,
              ...(allAnswered ? {} : styles.submitButtonDisabled)
            }}
            onClick={submitQuiz}
            disabled={!allAnswered}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    );
  }

  // Show start screen
  return (
    <div style={styles.container}>
      <div style={styles.startCard}>
        <FaQuestionCircle style={styles.startIcon} />
        <h2 style={styles.startTitle}>{quiz.title}</h2>
        <p style={styles.startDescription}>{quiz.description}</p>
        
        <div style={styles.startInfo}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Questions</span>
            <span style={styles.infoValue}>{questions.length}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Passing Score</span>
            <span style={styles.infoValue}>{quiz.passing_score}%</span>
          </div>
          {quiz.time_limit_minutes && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Time Limit</span>
              <span style={styles.infoValue}>{quiz.time_limit_minutes} min</span>
            </div>
          )}
        </div>

        {bestAttempt && (
          <div style={styles.previousAttempt}>
            <span style={styles.previousAttemptLabel}>Best Score:</span>
            <span style={styles.previousAttemptScore}>
              {bestAttempt.score}% {bestAttempt.passed && '✓'}
            </span>
          </div>
        )}

        <button style={styles.startButton} onClick={startQuiz}>
          {previousAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  loadingContainer: {
    padding: '48px',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  errorContainer: {
    padding: '48px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '48px',
    color: '#d1d5db',
    marginBottom: '16px'
  },
  errorText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  startCard: {
    textAlign: 'center'
  },
  startIcon: {
    fontSize: '64px',
    color: '#2563eb',
    marginBottom: '24px'
  },
  startTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '12px'
  },
  startDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px'
  },
  startInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  infoValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  previousAttempt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px'
  },
  previousAttemptLabel: {
    fontSize: '14px',
    color: '#1e40af'
  },
  previousAttemptScore: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  startButton: {
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  quizHeader: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  quizTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  quizDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  quizMeta: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '14px',
    color: '#6b7280'
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '32px'
  },
  questionCard: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  questionHeader: {
    marginBottom: '12px'
  },
  questionNumber: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '20px',
    lineHeight: '1.6'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  optionButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  optionRadio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  optionRadioInner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#2563eb'
  },
  optionText: {
    fontSize: '16px',
    color: '#374151',
    flex: 1
  },
  quizFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  progressText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  submitButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer'
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  resultCard: {
    textAlign: 'center'
  },
  resultIcon: {
    marginBottom: '24px'
  },
  resultTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  },
  scoreCircle: {
    width: '160px',
    height: '160px',
    margin: '0 auto 32px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '8px solid #2563eb'
  },
  scoreValue: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2563eb',
    lineHeight: 1
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px'
  },
  resultStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    marginBottom: '32px'
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultStatValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  resultStatLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  resultMessage: {
    fontSize: '18px',
    color: '#374151',
    marginBottom: '32px'
  },
  feedbackSection: {
    textAlign: 'left',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  feedbackTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px'
  },
  feedbackItem: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  feedbackQuestion: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  feedbackDetails: {
    marginTop: '8px'
  },
  feedbackText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  feedbackExplanation: {
    fontSize: '14px',
    color: '#374151',
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    borderLeft: '3px solid #f59e0b'
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer'
  }
};
