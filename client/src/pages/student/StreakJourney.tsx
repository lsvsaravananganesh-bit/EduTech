import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StreakOverviewData } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Flame,
  CheckCircle2,
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  Award,
  BookOpen,
  HeartHandshake,
  Target,
} from 'lucide-react';

export const StreakJourney: React.FC = () => {
  const [data, setData] = useState<StreakOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check-in state & toast message
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  // Log session modal
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [duration, setDuration] = useState(25);
  const [activityType, setActivityType] = useState('REVISE_TOPIC');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Weekly goal settings modal
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(120);
  const [remindersPaused, setRemindersPaused] = useState(false);

  const loadStreak = async () => {
    try {
      const [res, subjRes] = await Promise.all([
        api.streak.getOverview(),
        api.student.getSubjects(),
      ]);
      if (res.success) {
        setData(res.data);
        setWeeklyGoal(res.data.streak.weeklyGoalMinutes);
        setRemindersPaused(res.data.streak.remindersPaused);
      }
      if (subjRes.success) {
        setSubjects(subjRes.data);
        if (subjRes.data.length > 0) setSelectedSubjectId(subjRes.data[0].subjectId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setCheckInMessage(null);
    try {
      const res = await api.streak.checkIn();
      setCheckInMessage(res.message);
      loadStreak();
    } catch (err: any) {
      alert(err.message || 'Error checking in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.streak.logSession({
        durationMinutes: Number(duration),
        subjectId: selectedSubjectId || undefined,
        activityType,
        topic: topic || undefined,
        notes: notes || undefined,
      });
      alert(res.message);
      setSessionModalOpen(false);
      setTopic('');
      setNotes('');
      loadStreak();
    } catch (err: any) {
      alert(err.message || 'Error recording session');
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.streak.updateGoal({
        weeklyGoalMinutes: Number(weeklyGoal),
        remindersPaused,
      });
      setGoalModalOpen(false);
      loadStreak();
    } catch (err: any) {
      alert(err.message || 'Error saving goal');
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-12 text-center">Loading Streak Journey...</div>;
  }

  if (!data) {
    return <div className="text-xs text-slate-400 py-12 text-center">Journey data unavailable.</div>;
  }

  const { streak, milestones, journeyCheckpoints, nextSmallAction, recentSessions } = data;

  return (
    <div className="space-y-6">
      {/* Friendly Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Student Success</span>
            <span>/</span>
            <span>Habit Builder</span>
          </div>
          <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2 mt-1">
            <span>Streak Journey</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak.currentStreak} Days</span>
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Building steady learning consistency without burnout, shame, or guilt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGoalModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Goal Preferences</span>
          </button>
          <button
            onClick={() => setSessionModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white inline-flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Effort</span>
          </button>
        </div>
      </div>

      {/* Check-In Action & Encouragement Hero Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-2xl p-6 shadow-md border border-navy-800 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Daily Consistency Checkpoint
            </span>
            <span className="text-xs text-slate-400">• Reward Points: <strong className="text-amber-300">+{streak.rewardPoints} pts</strong></span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {streak.checkedInToday
              ? 'Awesome work! You are checked in for today. 🚀'
              : 'Keep the habit moving forward today!'}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Every meaningful 15-minute review counts. Missing a day is completely okay—SmartBro
            preserves all your earned milestones and gives you a welcoming recovery step.
          </p>

          {checkInMessage && (
            <div className="p-2.5 rounded-lg bg-teal-950/80 border border-teal-500/60 text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{checkInMessage}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || streak.checkedInToday}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              streak.checkedInToday
                ? 'bg-emerald-600 text-white cursor-default shadow-xs'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-glow-amber active:scale-95'
            }`}
          >
            {streak.checkedInToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Today's Check-in Complete</span>
              </>
            ) : checkingIn ? (
              <span>Recording...</span>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-current text-white animate-bounce" />
                <span>Daily Check-in (+15 pts)</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-400">
            Longest recorded streak: <strong className="text-white">{streak.longestStreak} days</strong>
          </span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-border dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-navy-900 dark:text-slate-100">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-slate-100">{streak.currentStreak}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">days</span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1 block">Consistent habit</span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-border dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-navy-900 dark:text-slate-100">Weekly Goal Progress</span>
            <Target className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-slate-100">{streak.minutesThisWeek}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">/ {streak.weeklyGoalMinutes} mins</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-seagreen-500 to-teal-500 h-1.5 rounded-full transition-all"
              style={{ width: `${streak.goalProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-border dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-navy-900 dark:text-slate-100">Total Focused Study</span>
            <Clock className="w-4 h-4 text-skyblue-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-slate-100">{streak.totalMinutesStudied}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">minutes</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">Logged study time</span>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-border dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-navy-900 dark:text-slate-100">Milestones Unlocked</span>
            <Trophy className="w-4 h-4 text-pinkpurple-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-navy-900 dark:text-slate-100">{milestones.length}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">badges</span>
          </div>
          <span className="text-[11px] text-seagreen-600 dark:text-seagreen-400 font-semibold mt-1 block">Journey achievements</span>
        </div>
      </div>

      {/* Signature Interactive Journey Map */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Journey Map & Checkpoints</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow your checkpoints as you build lasting academic confidence
            </p>
          </div>
          <span className="text-xs font-bold text-seagreen-800 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/60 px-2.5 py-1 rounded-full border border-seagreen-200 dark:border-seagreen-800">
            Day {streak.currentStreak} of Journey
          </span>
        </div>

        {/* Visual Road / Path */}
        <div className="relative py-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] relative">
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-5 h-1.5 bg-slate-100 dark:bg-slate-800 -z-0 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-pinkpurple-500 to-seagreen-500 transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (streak.currentStreak / 14) * 100)}%`,
                }}
              />
            </div>

            {journeyCheckpoints.map((cp, idx) => (
              <div key={cp.id} className="flex flex-col items-center relative z-10 text-center w-28">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 shadow-xs ${
                    cp.achieved
                      ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-white border-amber-400 shadow-glow-amber'
                      : cp.current
                      ? 'bg-gradient-to-tr from-seagreen-500 to-teal-500 text-white border-seagreen-400 ring-4 ring-seagreen-100 dark:ring-seagreen-950 shadow-glow-seagreen animate-pulse'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cp.achieved ? <CheckCircle2 className="w-5 h-5 text-white" /> : `Day ${cp.day}`}
                </div>

                <span className="font-bold text-navy-900 dark:text-slate-100 text-xs mt-2.5">{cp.title}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{cp.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Columns: Next Small Action & Recent Study Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Small Action Card */}
        <div className="bg-gradient-to-br from-seagreen-50/70 via-white to-sky-50/40 dark:from-seagreen-950/20 dark:via-[#111827] dark:to-skyblue-950/10 rounded-xl border border-seagreen-200 dark:border-seagreen-900/50 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-seagreen-800 dark:text-seagreen-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400" />
              <span>SmartBro Recommendation</span>
            </div>
            <h4 className="text-sm font-bold text-navy-900 dark:text-slate-100">{nextSmallAction.title}</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {nextSmallAction.description}
            </p>

            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-seagreen-800 dark:text-seagreen-300 bg-seagreen-100/80 dark:bg-seagreen-950/80 px-2.5 py-0.5 rounded-md border border-seagreen-200/80 dark:border-seagreen-850">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated: {nextSmallAction.estimatedMinutes} mins</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-seagreen-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setDuration(15);
                setActivityType('REVISE_TOPIC');
                setSessionModalOpen(true);
              }}
              className="text-xs font-bold text-seagreen-700 dark:text-seagreen-300 hover:text-seagreen-900 dark:hover:text-seagreen-200 inline-flex items-center gap-1 transition-colors"
            >
              <span>Take This Action Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Study Sessions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">Study Sessions & Learning History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tracked focus periods and subject activities</p>
            </div>
            <button
              onClick={() => setSessionModalOpen(true)}
              className="text-xs text-seagreen-700 dark:text-seagreen-400 hover:text-seagreen-900 dark:hover:text-seagreen-200 font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Session</span>
            </button>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No study sessions logged yet.</p>
          ) : (
            <div className="divide-y divide-border/60 dark:divide-slate-800">
              {recentSessions.slice(0, 5).map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-900 dark:text-slate-100">{s.subjectName}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {s.activityType.replace('_', ' ')}
                      </span>
                    </div>
                    {s.topic && <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{s.topic}</p>}
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-seagreen-700 dark:text-seagreen-400">{s.durationMinutes} mins</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{s.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Study Session Modal */}
      <Modal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title="Log Study Effort"
        subtitle="Record your learning activity to earn reward points and keep your streak active"
        maxWidth="md"
      >
        <form onSubmit={handleLogSession} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
            >
              {subjects.map((sub) => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="360"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
              >
                <option value="REVISE_TOPIC">Revise a Topic</option>
                <option value="SOLVE_QUESTIONS">Solve Practice Questions</option>
                <option value="REVIEW_MISTAKES">Review Past Mistakes</option>
                <option value="CLASS_ATTENDANCE">Attended Lecture / Lab</option>
                <option value="ASSIGNMENT">Complete Assignment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Topic or Module (Optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chapter 6 Trigonometry proofs"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reflection Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? Any question you want to ask your teacher or SmartBro?"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSessionModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Log Effort & Update Streak
            </button>
          </div>
        </form>
      </Modal>

      {/* Goal Preferences Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="Weekly Goal & Habit Settings"
        subtitle="Customize your target study time and quiet mode"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Study Minutes per Week</label>
            <input
              type="number"
              min="30"
              max="1200"
              step="15"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              required
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
            />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              120 mins = roughly 20 mins a day for 6 days.
            </span>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remindersPaused}
                onChange={(e) => setRemindersPaused(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-seagreen-600 focus:ring-seagreen-500 bg-white dark:bg-slate-800"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Pause Study Reminders (Quiet Mode)</span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-5 block mt-0.5">
              Useful during exam weeks, holidays, or busy periods without penalizing streaks.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-slate-800">
            <button
              type="button"
              onClick={() => setGoalModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
