import React, { useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS, TREE_TOPICS } from '../../data/treeData';
import { TopicId } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lightbulb,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { ProgressiveHintModal, QUIZ_HINT_STAGES } from '../ProgressiveHintModal';
import { getActiveUserId, getUserStorageKey } from '../../utils/userStorage';

export interface QuizSavedState {
  currentQuestionIndex: number;
  userAnswers: Record<string, number>;
  confirmedQuestions: Record<string, boolean>;
  questionTimeouts?: Record<string, boolean>;
  hintsUsed?: Record<string, boolean>;
  guidedSolveUsed?: Record<string, boolean>;
  submitted: boolean;
}

// In-memory cache isolated per user ID ensures zero cross-user leakage
const inMemoryQuizStateMap = new Map<string, QuizSavedState>();

export const loadSavedQuizState = (userId?: string): QuizSavedState | null => {
  const effectiveUserId = userId || getActiveUserId();
  if (inMemoryQuizStateMap.has(effectiveUserId)) {
    return inMemoryQuizStateMap.get(effectiveUserId)!;
  }
  try {
    const storageKey = getUserStorageKey(effectiveUserId, 'quiz_state');
    const raw = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryQuizStateMap.set(effectiveUserId, parsed);
      return parsed;
    }
  } catch {}
  return null;
};

export const saveQuizState = (state: QuizSavedState, userId?: string) => {
  const effectiveUserId = userId || getActiveUserId();
  inMemoryQuizStateMap.set(effectiveUserId, state);
  try {
    const storageKey = getUserStorageKey(effectiveUserId, 'quiz_state');
    const serialized = JSON.stringify(state);
    sessionStorage.setItem(storageKey, serialized);
    localStorage.setItem(storageKey, serialized);
  } catch {}
};

export const clearSavedQuizState = (userId?: string) => {
  const effectiveUserId = userId || getActiveUserId();
  inMemoryQuizStateMap.delete(effectiveUserId);
  try {
    const storageKey = getUserStorageKey(effectiveUserId, 'quiz_state');
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey);
  } catch {}
};

interface QuizViewProps {
  isDarkMode: boolean;
  userId?: string;
  onUpdateQuizScore?: (score: number, total: number) => void;
  onUpdateQuizProgress?: (completed: number, total: number) => void;
}

const QUESTION_TIME_LIMIT = 20; // 20 seconds time limit per question
const BASE_POINTS_PER_QUESTION = 25; // 25 pts * 2 questions = 50 pts per topic
const HINT_PENALTY = 5;
const GUIDED_SOLVE_PENALTY = 15;
const WRONG_ANSWER_PENALTY = 5;

export const QuizView: React.FC<QuizViewProps> = ({
  isDarkMode,
  userId,
  onUpdateQuizScore,
  onUpdateQuizProgress
}) => {
  const effectiveUserId = userId || getActiveUserId();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    if (typeof saved?.currentQuestionIndex === 'number') {
      return Math.max(0, Math.min(QUIZ_QUESTIONS.length - 1, saved.currentQuestionIndex));
    }
    return 0;
  });

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return saved?.userAnswers ?? {};
  });

  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<string, boolean>>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return saved?.confirmedQuestions ?? {};
  });

  const [questionTimeouts, setQuestionTimeouts] = useState<Record<string, boolean>>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return saved?.questionTimeouts ?? {};
  });

  const [hintsUsed, setHintsUsed] = useState<Record<string, boolean>>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return saved?.hintsUsed ?? {};
  });

  const [guidedSolveUsed, setGuidedSolveUsed] = useState<Record<string, boolean>>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return saved?.guidedSolveUsed ?? {};
  });

  const [submitted, setSubmitted] = useState<boolean>(() => {
    const saved = loadSavedQuizState(effectiveUserId);
    return Boolean(saved?.submitted);
  });

  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'hint' | 'guidedSolve'>('hint');
  const [revealedHintStages, setRevealedHintStages] = useState<Record<string, number>>({});

  // 20-second countdown timer for current question
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex] || QUIZ_QUESTIONS[0];
  const selectedAnswer = userAnswers[currentQ?.id];
  const isCurrentConfirmed = Boolean(confirmedQuestions[currentQ?.id]);
  const isCurrentTimedOut = Boolean(questionTimeouts[currentQ?.id]);
  const answeredCount = Object.keys(confirmedQuestions).length;

  // Question timer effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isCurrentConfirmed || submitted) {
      return;
    }

    setTimeLeft(QUESTION_TIME_LIMIT);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestionIndex, isCurrentConfirmed, submitted]);

  // Persist state
  useEffect(() => {
    saveQuizState({
      currentQuestionIndex,
      userAnswers,
      confirmedQuestions,
      questionTimeouts,
      hintsUsed,
      guidedSolveUsed,
      submitted
    }, effectiveUserId);
  }, [currentQuestionIndex, userAnswers, confirmedQuestions, questionTimeouts, hintsUsed, guidedSolveUsed, submitted, effectiveUserId]);

  // Calculate points for a specific question
  const calculateQuestionPoints = (qId: string): number => {
    const q = QUIZ_QUESTIONS.find((item) => item.id === qId);
    if (!q || !confirmedQuestions[qId]) return 0;
    if (questionTimeouts[qId]) return 0; // Timed out questions award 0 points

    const isCorrect = userAnswers[qId] === q.correctAnswerIndex;
    if (!isCorrect) return 0; // Incorrect answers award 0 points

    const hintDeduction = hintsUsed[qId] ? HINT_PENALTY : 0;
    const guidedDeduction = guidedSolveUsed[qId] ? GUIDED_SOLVE_PENALTY : 0;
    return Math.max(0, BASE_POINTS_PER_QUESTION - hintDeduction - guidedDeduction);
  };

  // Calculate total quiz points (out of 350 pts across all 7 topics)
  const calculateTotalQuizPoints = (): number => {
    let total = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      total += calculateQuestionPoints(q.id);
    });
    return total;
  };

  // Calculate topic quiz points (out of 50 pts)
  const calculateTopicQuizPoints = (topicId: TopicId): number => {
    let topicPts = 0;
    QUIZ_QUESTIONS.filter((q) => q.topicId === topicId).forEach((q) => {
      topicPts += calculateQuestionPoints(q.id);
    });
    return Math.min(50, topicPts);
  };

  // Sync progress & scores to parent and storage
  useEffect(() => {
    if (onUpdateQuizProgress) {
      onUpdateQuizProgress(answeredCount, totalQuestions);
    }
  }, [answeredCount, totalQuestions, onUpdateQuizProgress]);

  useEffect(() => {
    if (onUpdateQuizScore) {
      const pts = calculateTotalQuizPoints();
      onUpdateQuizScore(pts, 350);
    }
  }, [confirmedQuestions, userAnswers, questionTimeouts, hintsUsed, guidedSolveUsed, onUpdateQuizScore]);

  const handleSelectOption = (optionIndex: number) => {
    if (submitted || isCurrentConfirmed || isCurrentTimedOut) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  // Triggered when 20s time limit expires
  const handleTimeExpired = () => {
    if (isCurrentConfirmed) return;
    const qId = currentQ.id;
    setQuestionTimeouts((prev) => ({ ...prev, [qId]: true }));
    setConfirmedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  // Triggered when user clicks Submit Answer
  const handleConfirmAnswer = () => {
    if (selectedAnswer === undefined || isCurrentConfirmed) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const qId = currentQ.id;
    setConfirmedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setSubmitted(true);
      if (onUpdateQuizScore) {
        onUpdateQuizScore(calculateTotalQuizPoints(), 350);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const totalPointsEarned = calculateTotalQuizPoints();
  const currentTopicQuizPoints = calculateTopicQuizPoints(currentQ.topicId);
  const currentQPoints = calculateQuestionPoints(currentQ.id);

  const isCorrect = selectedAnswer !== undefined && selectedAnswer === currentQ?.correctAnswerIndex;
  const currentTopicMeta = TREE_TOPICS.find((t) => t.id === currentQ.topicId);

  // Timer color indicator
  const timerPercentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const timerColor = timeLeft > 10 ? 'text-emerald-400' : timeLeft > 5 ? 'text-amber-400' : 'text-rose-500 animate-pulse';
  const timerBarColor = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Quiz Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0e1424] border-violet-900/40 text-slate-100 shadow-xl shadow-violet-950/30'
            : 'bg-white border-blue-100 text-black shadow-sm'
        }`}
      >
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quiz Assessment (50 Pts Per Topic)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                isDarkMode ? 'bg-violet-950/50 border-violet-800/40 text-violet-300' : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
              Quiz Score: {totalPointsEarned} / 350 pts
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Tree DSA Quiz Module
        </h1>
        <p className="text-xs sm:text-sm mt-1.5 opacity-80 leading-relaxed max-w-2xl">
          100 points per topic divided equally between Visualize Games (50 pts) and Quiz (50 pts).
          Each question has a <strong>20-second time limit</strong> and base value of <strong>25 points</strong>.
        </p>

        {/* Question Progress and Status Boxes */}
        <div className="mt-6 space-y-3">
          <div className="text-xs sm:text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>Progress:</span>
              <span
                id="quiz-progress-counter"
                className={`font-bold font-mono ${isDarkMode ? 'text-violet-400' : 'text-violet-800'}`}
              >
                {answeredCount}/{totalQuestions}
              </span>
              <span className="opacity-75">Completed</span>
            </div>

            <div className="text-xs font-semibold opacity-75">
              Current Topic ({currentTopicMeta?.title?.split('.')[1]?.trim() || currentQ.topicId}):{' '}
              <span className="font-bold text-violet-400">{currentTopicQuizPoints} / 50 pts</span>
            </div>
          </div>

          {/* Q1..Q14 Status Boxes Row */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isConfirmed = Boolean(confirmedQuestions[q.id]);
              const isTimedOut = Boolean(questionTimeouts[q.id]);
              const isAnsCorrect = userAnswers[q.id] === q.correctAnswerIndex;
              const qPts = calculateQuestionPoints(q.id);

              let boxStyle = '';
              let content = null;

              if (isConfirmed) {
                if (isTimedOut) {
                  boxStyle = isDarkMode
                    ? 'bg-amber-950/40 border border-amber-600/70 text-amber-200 font-semibold'
                    : 'bg-amber-50 border border-amber-400 text-amber-900 font-semibold';
                  content = (
                    <div className="flex items-center justify-center gap-1">
                      <span>Q{idx + 1}</span>
                      <Clock className="w-3 h-3 text-amber-400" />
                    </div>
                  );
                } else if (isAnsCorrect) {
                  boxStyle = isDarkMode
                    ? 'bg-[#063b27] border border-emerald-500/80 text-white font-semibold shadow-sm'
                    : 'bg-emerald-100 border border-emerald-600 text-emerald-950 font-semibold shadow-sm';
                  content = (
                    <div className="flex items-center justify-center gap-1">
                      <span>Q{idx + 1}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    </div>
                  );
                } else {
                  boxStyle = isDarkMode
                    ? 'bg-[#3f0d18] border border-rose-500/80 text-white font-semibold shadow-sm'
                    : 'bg-rose-100 border border-rose-600 text-rose-950 font-semibold shadow-sm';
                  content = (
                    <div className="flex items-center justify-center gap-1">
                      <span>Q{idx + 1}</span>
                      <X className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
                    </div>
                  );
                }
              } else if (isCurrent) {
                boxStyle = isDarkMode
                  ? 'bg-violet-600 border border-violet-400 text-white font-bold shadow-md shadow-violet-950/60 ring-2 ring-violet-400/50'
                  : 'bg-indigo-600 border border-indigo-400 text-white font-bold shadow-md shadow-indigo-300/60 ring-2 ring-indigo-400/50';
                content = <span>Q{idx + 1}</span>;
              } else {
                boxStyle = isDarkMode
                  ? 'bg-[#12192c] text-slate-400 border border-violet-950/70 hover:border-violet-700/60 hover:text-slate-200'
                  : 'bg-blue-50 text-blue-900 border border-blue-200 hover:border-blue-300 hover:text-black';
                content = <span>Q{idx + 1}</span>;
              }

              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 flex items-center justify-center cursor-pointer shrink-0 ${boxStyle}`}
                  title={`Question ${idx + 1} (${qPts} pts)`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Banner */}
        {submitted && (
          <div
            className={`mt-6 p-5 rounded-2xl border flex items-center gap-4 ${
              totalPointsEarned >= 200
                ? isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isDarkMode
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Award className="w-8 h-8 shrink-0 text-amber-400" />
            <div>
              <div className="text-sm font-bold">
                Assessment Completed!
              </div>
              <div className="text-xs opacity-90">
                You earned <strong>{totalPointsEarned} out of 350 points</strong> across all 7 topic quiz modules! View your full Progress Dashboard for the overall breakdown.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Single Question Card */}
      {currentQ && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border transition-all duration-200 relative overflow-hidden ${
            isDarkMode
              ? 'bg-[#0e1424] border-violet-900/40 text-slate-100 shadow-xl shadow-violet-950/20'
              : 'bg-white border-blue-100 text-black shadow-sm'
          }`}
        >
          {/* Card Top Meta & 20s Countdown Timer */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                isDarkMode ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'bg-violet-100 text-violet-800 border border-violet-200'
              }`}>
                Question {String(currentQuestionIndex + 1).padStart(2, '0')} of {totalQuestions}
              </span>
              <span className="text-xs font-semibold opacity-70">
                Topic: {currentTopicMeta?.title?.split('.')[1]?.trim() || currentQ.topicId}
              </span>
            </div>

            {/* 20-Second Countdown Timer Badge */}
            {!isCurrentConfirmed ? (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono font-bold text-xs ${
                  isDarkMode ? 'bg-[#151c2e] border-violet-900/50' : 'bg-blue-50 border-blue-200'
                } ${timerColor}`}
                title="Time remaining for this question"
              >
                <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                <span>⏱️ {timeLeft}s</span>
              </div>
            ) : (
              <span
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                  isCurrentTimedOut
                    ? isDarkMode
                      ? 'bg-amber-950/60 border-amber-600 text-amber-400'
                      : 'bg-amber-50 border-amber-300 text-amber-700'
                    : isCorrect
                    ? isDarkMode
                      ? 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : isDarkMode
                    ? 'bg-rose-950/60 border-rose-600 text-rose-400'
                    : 'bg-rose-50 border-rose-300 text-rose-700'
                }`}
              >
                {isCurrentTimedOut ? (
                  <>
                    <Clock className="w-4 h-4" /> Time Expired (0 pts)
                  </>
                ) : isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Correct (+{currentQPoints} pts)
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                  </>
                )}
              </span>
            )}
          </div>

          {/* 20s Animated Progress Bar */}
          {!isCurrentConfirmed && (
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className={`h-full transition-all duration-1000 ${timerBarColor}`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          )}

          {/* Question Title */}
          <h3 className="text-base sm:text-lg font-bold mb-4 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Point Breakdown / Deduction Notice for this question */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-lg border font-medium ${
              isDarkMode ? 'bg-[#12192d] border-violet-950 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              Base Value: <strong>25 pts</strong>
            </span>
            {hintsUsed[currentQ.id] && (
              <span className="px-2.5 py-1 rounded-lg border bg-amber-950/30 border-amber-500/40 text-amber-300 font-medium">
                Hint Used (-5 pts)
              </span>
            )}
            {guidedSolveUsed[currentQ.id] && (
              <span className="px-2.5 py-1 rounded-lg border bg-rose-950/30 border-rose-500/40 text-rose-300 font-medium">
                Guided Solve Used (-15 pts)
              </span>
            )}
            {isCurrentConfirmed && !isCorrect && !isCurrentTimedOut && (
              <span className="px-2.5 py-1 rounded-lg border bg-rose-950/30 border-rose-500/40 text-rose-300 font-medium">
                Incorrect (-5 pts penalty)
              </span>
            )}
            {isCurrentConfirmed && isCurrentTimedOut && (
              <span className="px-2.5 py-1 rounded-lg border bg-amber-950/30 border-amber-500/40 text-amber-300 font-medium">
                Timed Out: 0 pts awarded
              </span>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswer === optIdx;
              let optionStyle = isDarkMode
                ? 'bg-[#090d18] border-violet-950/70 text-slate-200 hover:border-violet-600/50'
                : 'bg-blue-50/40 border-blue-100 text-black hover:border-blue-400 hover:bg-blue-50';

              if (isSelected && !isCurrentConfirmed) {
                optionStyle = isDarkMode
                  ? 'bg-violet-600/30 border-violet-500 text-white font-bold ring-1 ring-violet-500/40'
                  : 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-500/40';
              }

              if (isCurrentConfirmed) {
                if (optIdx === currentQ.correctAnswerIndex) {
                  optionStyle = isDarkMode
                    ? 'bg-[#063b27] border-emerald-500 text-white font-bold'
                    : 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = isDarkMode
                    ? 'bg-[#3f0d18] border-rose-500 text-rose-200 font-semibold'
                    : 'bg-rose-100 border-rose-600 text-rose-950 font-semibold';
                } else {
                  optionStyle = isDarkMode
                    ? 'bg-[#090d18]/40 border-violet-950/40 text-slate-500 opacity-60'
                    : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={isCurrentConfirmed || isCurrentTimedOut}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyle} ${
                    isCurrentConfirmed ? 'cursor-default' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isCurrentConfirmed && optIdx === currentQ.correctAnswerIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isCurrentConfirmed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Confirmation */}
          {isCurrentConfirmed && (
            <div
              className={`mt-6 p-4 rounded-2xl border text-xs leading-relaxed ${
                isDarkMode
                  ? 'bg-[#090d18] border-violet-950/80 text-violet-300'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              }`}
            >
              <span className={`font-bold uppercase tracking-wider block mb-1 ${
                isDarkMode ? 'text-violet-400' : 'text-indigo-800'
              }`}>
                Explanation
              </span>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation & Action Controls Row */}
          <div className={`mt-8 pt-5 border-t ${isDarkMode ? 'border-violet-950/60' : 'border-blue-100'} flex items-center justify-between gap-3`}>
            {/* Left: Previous Button, Hint Button (-5 pts), Guided Solve Button (-15 pts) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="quiz-prev-btn"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  currentQuestionIndex > 0
                    ? isDarkMode
                      ? 'bg-[#141b2d] hover:bg-[#1c2740] text-slate-200 border border-violet-900/40 cursor-pointer'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-black border border-blue-200 cursor-pointer'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {/* Hint Button (-5 pts) */}
              <button
                id="quiz-hint-btn"
                onClick={() => {
                  setModalMode('hint');
                  setIsHintModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#121829] hover:bg-[#1a233a] border-amber-900/50 text-amber-300'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                }`}
                title="Open Hint (Warning: -5 pts deduction)"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Hint (-5 pts)</span>
              </button>

              {/* Guided Solve Button (-15 pts) */}
              <button
                id="quiz-guided-solve-btn"
                onClick={() => {
                  setModalMode('guidedSolve');
                  setIsHintModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#121829] hover:bg-[#1a233a] border-violet-900/50 text-violet-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                }`}
                title="Open Guided Solve (Warning: -15 pts deduction)"
              >
                <Compass className="w-3.5 h-3.5 text-violet-400" />
                <span>Guided Solve (-15 pts)</span>
              </button>
            </div>

            {/* Right: Submit Answer / Next Button */}
            <div className="flex items-center gap-2.5">
              {!isCurrentConfirmed ? (
                <button
                  id="quiz-confirm-btn"
                  onClick={handleConfirmAnswer}
                  disabled={selectedAnswer === undefined}
                  className={`flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                    selectedAnswer !== undefined
                      ? isDarkMode
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40 ring-1 ring-violet-400/50 cursor-pointer hover:scale-[1.02]'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-300/60 cursor-pointer hover:scale-[1.02]'
                      : isDarkMode
                      ? 'bg-[#141b2d]/60 text-slate-500 border border-violet-950/40 cursor-not-allowed opacity-60'
                      : 'bg-blue-50/60 text-blue-900/40 border border-blue-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  id="quiz-next-btn"
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] ${
                    isDarkMode
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40 ring-1 ring-violet-400/50'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-300/60'
                  }`}
                >
                  <span>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progressive Hint & Guided Solve Modal */}
      {currentQ && (
        <ProgressiveHintModal
          isOpen={isHintModalOpen}
          onClose={() => setIsHintModalOpen(false)}
          isDarkMode={isDarkMode}
          topicId={currentQ.topicId}
          topicTitle="Quiz Challenge"
          question={currentQ.question}
          questionId={currentQ.id}
          customHints={QUIZ_HINT_STAGES[currentQ.id]}
          revealedStage={(currentQ?.id && revealedHintStages[currentQ.id]) || 1}
          initialMode={modalMode}
          onRevealNextStage={() =>
            setRevealedHintStages((prev) => ({
              ...prev,
              [currentQ.id]: Math.min(3, (prev[currentQ.id] || 1) + 1)
            }))
          }
          onHintUsed={() => {
            setHintsUsed((prev) => ({ ...prev, [currentQ.id]: true }));
          }}
          onGuidedSolveUsed={() => {
            setGuidedSolveUsed((prev) => ({ ...prev, [currentQ.id]: true }));
          }}
          returnButtonText="Got It, Return to Challenge"
        />
      )}
    </div>
  );
};
