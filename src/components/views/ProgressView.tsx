import React, { useState, useEffect } from 'react';
import { NavItem, TopicId, TopicPointsDetail } from '../../types';
import {
  TrendingUp,
  CheckCircle2,
  Circle,
  BookOpen,
  Layers,
  Terminal,
  Trophy,
  Zap,
  Video,
  BrainCircuit,
  Globe,
  GitBranch,
  Target,
  Award,
  Activity,
  Clock,
  Lock,
  Check,
  Flame,
  Sparkles,
  Gamepad2,
  HelpCircle
} from 'lucide-react';
import { getActiveUserId, getUserItem, setUserItem } from '../../utils/userStorage';
import { QUIZ_QUESTIONS, TREE_TOPICS } from '../../data/treeData';
import { loadSavedQuizState } from './QuizView';

interface ProgressViewProps {
  userId?: string;
  completedTopics: TopicId[];
  quizScore: { score: number; total: number } | null;
  completedVisualizations?: string[];
  onNavigate: (nav: NavItem, topicId?: TopicId) => void;
  onToggleTopicCompleted?: (topicId: TopicId) => void;
  isDarkMode: boolean;
  uploadedVideoUrl?: string | null;
  uploadedVideoName?: string;
  uploadedVideoSize?: string;
  isVideoCompleted?: boolean;
  onUploadVideo?: (file: File) => void;
  onRemoveVideo?: () => void;
  onToggleVideoCompleted?: () => void;
  onWatchAgain?: () => void;
}

const TOPICS_CONFIG: { id: TopicId; title: string; category: string }[] = [
  { id: 'basics', title: '01. Tree-Non linear Datastructure', category: 'Fundamentals' },
  { id: 'terminology', title: '02. Tree Terminology', category: 'Fundamentals' },
  { id: 'types', title: '03. Types of Trees', category: 'Tree Types' },
  { id: 'binary-tree', title: '04. Binary Tree & Properties', category: 'Tree Types' },
  { id: 'bst', title: '05. Binary Search Tree (BST)', category: 'Search Trees' },
  { id: 'traversals', title: '06. Tree Traversals', category: 'Traversals' },
  { id: 'applications', title: '07. Real-World Applications', category: 'Applications' },
];

export const ProgressView: React.FC<ProgressViewProps> = ({
  completedTopics,
  quizScore,
  completedVisualizations = [],
  onNavigate,
  onToggleTopicCompleted,
  isDarkMode,
  userId,
  uploadedVideoUrl,
  uploadedVideoName,
  uploadedVideoSize,
  isVideoCompleted = false,
  onUploadVideo,
  onRemoveVideo,
  onToggleVideoCompleted,
  onWatchAgain,
}) => {
  const effectiveUserId = userId || getActiveUserId();

  // Load live quiz state
  const [quizStateTick, setQuizStateTick] = useState<number>(0);

  useEffect(() => {
    // refresh quiz state when quizScore updates
    setQuizStateTick((t) => t + 1);
  }, [quizScore]);

  const quizState = loadSavedQuizState(effectiveUserId);
  const confirmed = quizState?.confirmedQuestions || {};
  const userAnswers = quizState?.userAnswers || {};
  const questionTimeouts = quizState?.questionTimeouts || {};
  const hintsUsed = quizState?.hintsUsed || {};
  const guidedSolveUsed = quizState?.guidedSolveUsed || {};

  // Compute points per topic:
  // 100 points per topic divided equally:
  // - Visualize Game Module: 50 points (awarded when video is 100% completed)
  // - Quiz Module: 50 points (2 questions * 25 base points, with deductions for wrong answers, hints, guided solve, or timeout)
  const topicPointsList: TopicPointsDetail[] = TOPICS_CONFIG.map((tc) => {
    // 1. Visualize points for this topic
    const vizPoints = isVideoCompleted ? 50 : 0;

    // 2. Quiz points for this topic
    const topicQuestions = QUIZ_QUESTIONS.filter((q) => q.topicId === tc.id);
    let quizPts = 0;
    let hintsCount = 0;
    let guidedCount = 0;
    let incorrectCount = 0;
    let deductionsTotal = 0;

    topicQuestions.forEach((q) => {
      const isConf = Boolean(confirmed[q.id]);
      const isTimeout = Boolean(questionTimeouts[q.id]);
      const isAnsCorrect = isConf && !isTimeout && userAnswers[q.id] === q.correctAnswerIndex;

      if (hintsUsed[q.id]) {
        hintsCount++;
        deductionsTotal += 5;
      }
      if (guidedSolveUsed[q.id]) {
        guidedCount++;
        deductionsTotal += 15;
      }
      if (isConf && !isAnsCorrect && !isTimeout) {
        incorrectCount++;
        deductionsTotal += 5;
      }

      if (isConf && isAnsCorrect) {
        const hintDed = hintsUsed[q.id] ? 5 : 0;
        const guidedDed = guidedSolveUsed[q.id] ? 15 : 0;
        const qEarned = Math.max(0, 25 - hintDed - guidedDed);
        quizPts += qEarned;
      }
    });

    const totalPts = Math.min(100, Math.max(0, vizPoints + quizPts));

    return {
      topicId: tc.id,
      title: tc.title,
      visualizePoints: vizPoints,
      visualizeTotal: 50,
      quizPoints: quizPts,
      quizTotal: 50,
      totalPoints: totalPts,
      maxPoints: 100,
      hintsUsedCount: hintsCount,
      guidedSolveUsedCount: guidedCount,
      incorrectAnswersCount: incorrectCount,
      totalDeductions: deductionsTotal,
    };
  });

  // Section totals:
  const totalVizPointsEarned = topicPointsList.reduce((acc, t) => acc + t.visualizePoints, 0); // out of 350
  const totalQuizPointsEarned = topicPointsList.reduce((acc, t) => acc + t.quizPoints, 0); // out of 350
  const totalLearnPointsEarned = 0; // 0 points for learn section as requested
  const totalCoursePointsEarned = totalVizPointsEarned + totalQuizPointsEarned; // out of 700

  // Total completion percentage:
  const totalCompletionPercentage = Math.round((totalCoursePointsEarned / 700) * 100);

  const masteredTopicsCount = topicPointsList.filter((t) => t.totalPoints >= 100).length;

  return (
    <div id="progress-view-root" className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Top Header Card (Refresh/Reset buttons completely removed) */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/30'
            : 'bg-white border-blue-100 text-black shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider mb-3 ${
                isDarkMode
                  ? 'bg-violet-600/20 text-[#A78BFA] border border-violet-500/30'
                  : 'bg-[#6D3DF5]/10 text-[#6D3DF5] border border-[#6D3DF5]/30'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>TREE-NON LINEAR DATASTRUCTURE</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              isDarkMode ? 'text-[#F8FAFC]' : 'text-black'
            }`}>
              Student Performance & Progress Dashboard
            </h1>
            <p className={`text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl ${
              isDarkMode ? 'text-[#E2E8F0]' : 'text-blue-900'
            }`}>
              100 points per topic divided equally between Visualize Games (50 pts) and Quiz (50 pts).
              Points are awarded only for the Visualize Games and Quiz sections.
            </p>
          </div>

          {/* Quick Score Badge */}
          <div className="shrink-0 flex items-center gap-3">
            <div className={`p-4 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#12192d] border-violet-800/40 text-violet-300' : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Course Points</div>
              <div className="text-2xl font-black font-mono mt-0.5">{totalCoursePointsEarned} / 700</div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">{totalCompletionPercentage}% Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 SUMMARY CARDS: Total Completion % & Section Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* CARD 1 — TOTAL COMPLETION PERCENTAGE */}
        <div
          id="summary-card-total-completion"
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
            isDarkMode
              ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
              : 'bg-white border-blue-100 text-black shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold font-mono uppercase tracking-wider ${
                isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
              }`}>
                TOTAL COMPLETION
              </span>
              <Target className={`w-4 h-4 ${isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'}`} />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {totalCompletionPercentage}%
              </span>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-blue-700'}`}>
                Overall Course Score
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-2.5 rounded-full overflow-hidden mt-4 border ${
              isDarkMode ? 'bg-violet-950/50 border-violet-800/30' : 'bg-blue-50 border-blue-200'
            }`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-[#6D3DF5] to-emerald-400 transition-all duration-700 shadow-sm"
                style={{ width: `${totalCompletionPercentage}%` }}
              />
            </div>
          </div>

          <div className={`mt-5 pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
            isDarkMode ? 'border-violet-950/50 text-[#94A3B8]' : 'border-blue-100 text-blue-700'
          }`}>
            <span>Total Points</span>
            <span className={isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'}>
              {totalCoursePointsEarned} / 700 pts
            </span>
          </div>
        </div>

        {/* CARD 2 — SECTION POINTS BREAKDOWN */}
        <div
          id="summary-card-section-points"
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
            isDarkMode
              ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
              : 'bg-white border-blue-100 text-black shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold font-mono uppercase tracking-wider ${
                isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
              }`}>
                SECTION POINTS SUMMARY
              </span>
              <Zap className={`w-4 h-4 ${isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'}`} />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 opacity-80">
                  <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Visualize Games:</span>
                </span>
                <span className="font-bold font-mono text-emerald-400">
                  {totalVizPointsEarned} / 350 pts
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 opacity-80">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quiz Assessment:</span>
                </span>
                <span className="font-bold font-mono text-violet-300">
                  {totalQuizPointsEarned} / 350 pts
                </span>
              </div>
              <div className="flex items-center justify-between opacity-70">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Learn Theory:</span>
                </span>
                <span className="font-mono">
                  0 / 0 pts (No pts awarded)
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-5 pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
            isDarkMode ? 'border-violet-950/50 text-[#94A3B8]' : 'border-blue-100 text-blue-700'
          }`}>
            <span>Total Earned</span>
            <span className={isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'}>
              {totalCoursePointsEarned} / 700 pts
            </span>
          </div>
        </div>

        {/* CARD 3 — TOPIC MASTERY SUMMARY */}
        <div
          id="summary-card-topic-mastery"
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
            isDarkMode
              ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
              : 'bg-white border-blue-100 text-black shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold font-mono uppercase tracking-wider ${
                isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
              }`}>
                TOPIC MASTERY
              </span>
              <Award className={`w-4 h-4 ${isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'}`} />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {masteredTopicsCount}/7
              </span>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-blue-700'}`}>
                Topics at 100/100 Pts
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className={`w-full h-2.5 rounded-full overflow-hidden mt-4 border ${
              isDarkMode ? 'bg-violet-950/50 border-violet-800/30' : 'bg-blue-50 border-blue-200'
            }`}>
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(masteredTopicsCount / 7) * 100}%` }}
              />
            </div>
          </div>

          <div className={`mt-5 pt-3 border-t text-[11px] font-mono flex items-center justify-between ${
            isDarkMode ? 'border-violet-950/50 text-[#94A3B8]' : 'border-blue-100 text-blue-700'
          }`}>
            <span>Points Rule</span>
            <span>100 pts per topic</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DETAILED POINTS EARNED / TOTAL POINTS FOR EACH SECTION */}
      <div
        id="section-points-detailed-breakdown"
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
            : 'bg-white border-blue-100 text-black shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
            isDarkMode
              ? 'bg-violet-950/60 border-violet-800/40 text-[#A78BFA]'
              : 'bg-violet-50 border-violet-200 text-[#6D3DF5]'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase ${
              isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
            }`}>
              SECTION BREAKDOWN
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 ${
              isDarkMode ? 'text-[#F8FAFC]' : 'text-black'
            }`}>
              Points Earned / Total Points by Section
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* SECTION A: VISUALIZE GAMES */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-[#090d18] border-violet-950/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Visualize Games</span>
                </span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  isVideoCompleted
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isVideoCompleted ? 'Full Completion' : 'In Progress'}
                </span>
              </div>
              <div className="text-3xl font-black font-mono">
                {totalVizPointsEarned} <span className="text-sm opacity-60">/ 350 pts</span>
              </div>
              <p className="text-xs opacity-75 mt-2 leading-relaxed">
                50 points awarded for each of the 7 topics. Students must watch the complete video to earn points. Incomplete video awards 0 points.
              </p>
            </div>
            <button
              onClick={() => onNavigate('visualize')}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isDarkMode
                  ? 'bg-violet-950/60 hover:bg-violet-900/60 border-violet-800/60 text-violet-200'
                  : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900'
              }`}
            >
              Open Visualize Section →
            </button>
          </div>

          {/* SECTION B: QUIZ ASSESSMENT */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-[#090d18] border-violet-950/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Quiz Assessment</span>
                </span>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border bg-violet-950/50 text-violet-300 border-violet-800/40">
                  {Object.keys(confirmed).length}/14 Qs Answered
                </span>
              </div>
              <div className="text-3xl font-black font-mono">
                {totalQuizPointsEarned} <span className="text-sm opacity-60">/ 350 pts</span>
              </div>
              <p className="text-xs opacity-75 mt-2 leading-relaxed">
                50 points per topic (2 questions @ 25 pts each). 20s time limit per question. Deductions apply for hints (-5), guided solve (-15), and wrong answers (-5).
              </p>
            </div>
            <button
              onClick={() => onNavigate('quiz')}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isDarkMode
                  ? 'bg-violet-950/60 hover:bg-violet-900/60 border-violet-800/60 text-violet-200'
                  : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900'
              }`}
            >
              Open Quiz Assessment →
            </button>
          </div>

          {/* SECTION C: LEARN SECTION */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between opacity-80 ${
            isDarkMode ? 'bg-[#090d18] border-violet-950/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Learn Theory</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                  Study Only
                </span>
              </div>
              <div className="text-3xl font-black font-mono">
                0 <span className="text-sm opacity-60">/ 0 pts</span>
              </div>
              <p className="text-xs opacity-75 mt-2 leading-relaxed">
                Theory and conceptual reading modules. Points are awarded exclusively for Visualize Games and Quiz sections.
              </p>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isDarkMode
                  ? 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              Explore Study Syllabus →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: OVERALL POINTS EARNED OUT OF 100 FOR EACH TOPIC */}
      <div
        id="topic-points-breakdown-section"
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
            : 'bg-white border-blue-100 text-black shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDarkMode
                ? 'bg-violet-950/60 border-violet-800/40 text-[#A78BFA]'
                : 'bg-violet-50 border-violet-200 text-[#6D3DF5]'
            }`}>
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase ${
                isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
              }`}>
                TOPIC POINTS DASHBOARD
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 ${
                isDarkMode ? 'text-[#F8FAFC]' : 'text-black'
              }`}>
                Overall Points Earned by Topic (out of 100)
              </h2>
            </div>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-full border bg-violet-950/50 text-violet-300 border-violet-800/40">
            7 Topics · 100 Points Each
          </div>
        </div>

        {/* 7 Topic Point Cards Grid */}
        <div className="space-y-4">
          {topicPointsList.map((t) => {
            const isMastered = t.totalPoints >= 100;
            const percentage = t.totalPoints; // since max is 100

            return (
              <div
                key={t.topicId}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isMastered
                    ? isDarkMode
                      ? 'bg-[#06241a] border-emerald-600/50 shadow-md shadow-emerald-950/30'
                      : 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                    : isDarkMode
                    ? 'bg-[#090d18] border-violet-950/80 hover:border-violet-700/60'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Topic Title & Modules Breakdown */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-violet-950/60 text-violet-400'
                      }`}>
                        Topic {t.topicId.toUpperCase()}
                      </span>

                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                        isMastered
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : t.totalPoints > 0
                          ? 'bg-violet-950 text-violet-300 border-violet-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isMastered ? 'Mastered (100%)' : t.totalPoints > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold tracking-tight truncate">
                      {t.title}
                    </h3>

                    {/* Modules breakdown inside this topic */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 opacity-90">
                        <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                        <span>Visualize Game: <strong>{t.visualizePoints} / 50 pts</strong></span>
                      </span>

                      <span className="opacity-40">•</span>

                      <span className="flex items-center gap-1.5 opacity-90">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Quiz: <strong>{t.quizPoints} / 50 pts</strong></span>
                      </span>

                      {t.totalDeductions > 0 && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="text-rose-400 font-medium">
                            Deductions: -{t.totalDeductions} pts (Hints: {t.hintsUsedCount}, Guided: {t.guidedSolveUsedCount})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Score Pill & Action Buttons */}
                  <div className="shrink-0 flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                        {t.totalPoints} <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <div className="text-[10px] font-semibold opacity-75">
                        Topic Points Earned
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('learn', t.topicId)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#12192d] hover:bg-[#1a233d] border-violet-900/50 text-slate-200'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                        }`}
                        title="Study topic concepts"
                      >
                        Study
                      </button>

                      <button
                        onClick={() => onNavigate('quiz')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isDarkMode
                            ? 'bg-violet-600 hover:bg-violet-500 border-violet-500 text-white shadow-md'
                            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md'
                        }`}
                        title="Take quiz for this topic"
                      >
                        Quiz
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Progress Bar for Topic */}
                <div className="mt-3.5 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isMastered ? 'bg-emerald-400' : 'bg-gradient-to-r from-violet-600 to-indigo-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: VISUAL LESSONS (No manual toggle button or cheat button) */}
      <div
        id="progress-visual-lessons-section"
        className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0e1424] border-violet-900/40 text-[#F8FAFC] shadow-xl shadow-violet-950/20'
            : 'bg-white border-blue-100 text-black shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDarkMode
                ? 'bg-violet-950/60 border-violet-800/40 text-[#A78BFA]'
                : 'bg-violet-50 border-violet-200 text-[#6D3DF5]'
            }`}>
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase ${
                isDarkMode ? 'text-[#A78BFA]' : 'text-[#6D3DF5]'
              }`}>
                VISUAL LESSONS
              </div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight mt-0.5 ${
                isDarkMode ? 'text-[#F8FAFC]' : 'text-black'
              }`}>
                Tree DSA Complete Visual Lesson ({isVideoCompleted ? '350 / 350 pts Earned' : '0 / 350 pts Earned'})
              </h2>
            </div>
          </div>
        </div>

        {/* Video Lesson Item Card */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isDarkMode
              ? 'bg-[#090d18] border-violet-950/70'
              : 'bg-blue-50/40 border-blue-100'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isVideoCompleted ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />

            <div className="min-w-0">
              <span className={`font-bold text-sm sm:text-base truncate block ${
                isDarkMode ? 'text-slate-100' : 'text-black'
              }`}>
                Tree DSA Complete Visual Lesson
              </span>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-blue-900'}`}>
                {isVideoCompleted
                  ? '✅ Complete video watched and finished! 350 points awarded (50 points for each topic).'
                  : 'ℹ️ Must watch the entire video from start to finish to award points (0 points for incomplete videos).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              id="btn-watch-again-progress"
              onClick={() => onNavigate('visualize')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                isDarkMode
                  ? 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              <span>{isVideoCompleted ? 'Watch Again →' : 'Start Lesson Video →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
