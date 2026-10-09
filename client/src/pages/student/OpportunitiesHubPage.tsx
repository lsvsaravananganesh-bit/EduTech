import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Trophy,
  Calendar,
  ExternalLink,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Flame,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  prizePool: string;
  deadline: string;
  mode: 'Online' | 'Hybrid' | 'National';
  eligibility: string;
  tags: string[];
  link: string;
  badge: string;
}

const HACKATHONS: Hackathon[] = [
  {
    id: 'h-1',
    name: 'Smart India Hackathon (SIH 2026)',
    organizer: 'Ministry of Education & AICTE',
    prizePool: '₹1,00,000 / Problem Statement',
    deadline: 'Registration Closes in 18 Days',
    mode: 'National',
    eligibility: 'All Engineering & Technology Undergrads',
    tags: ['GovTech', 'AI / ML', 'Hardware & IoT', 'EdTech'],
    link: 'https://sih.gov.in',
    badge: 'FLAGSHIP 🇮🇳',
  },
  {
    id: 'h-2',
    name: 'Google Summer of Code (GSoC 2026)',
    organizer: 'Google Open Source Programs Office',
    prizePool: '$3,000 - $6,600 Contributor Stipend',
    deadline: 'Proposal Window Opens Soon',
    mode: 'Online',
    eligibility: 'Open to All Enrolled University Students',
    tags: ['Open Source', 'Linux', 'Kubernetes', 'Compilers'],
    link: 'https://summerofcode.withgoogle.com',
    badge: 'GLOBAL 🌐',
  },
  {
    id: 'h-3',
    name: 'TCS CodeVita Season 12',
    organizer: 'Tata Consultancy Services',
    prizePool: '$20,000 + Direct TCS Digital / Prime Offers',
    deadline: 'Round 1 Qualifier in 24 Days',
    mode: 'Online',
    eligibility: 'Engineering Batch of 2025 - 2027',
    tags: ['Competitive Coding', 'Speed DSA', 'C++ / Java'],
    link: 'https://campuscommune.tcs.com',
    badge: 'CAREER ACCELERATOR 🚀',
  },
];

export const OpportunitiesHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'pomodoro'>('opportunities');

  // Pomodoro timer state
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'lofi' | 'rain' | 'library'>('none');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setCompletedSessions((prev) => prev + 1);
      // Auto log streak session
      api.streak.logSession({
        durationMinutes: focusMinutes,
        activityType: 'REVISE_TOPIC',
        topic: 'Study Arena Pomodoro Deep Work Session',
        notes: `Completed ${focusMinutes}-minute focused study block.`,
      }).catch(console.warn);
      alert('Focus block complete! Great job building your consistency streak (+15 XP).');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft, focusMinutes]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const resetTimer = (mins: number) => {
    setIsTimerRunning(false);
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const formatTimer = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Student Portal</span>
            <span>/</span>
            <span className="text-pinkpurple-600 dark:text-pinkpurple-400 font-semibold">Campus & Focus Arena</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pinkpurple-100 dark:bg-pinkpurple-950/60 text-pinkpurple-600 dark:text-pinkpurple-400">
                🌐
              </span>
              <span>Campus Opportunities & Study Arena</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800">
              Lumixora Network
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified national hackathons, global internships, and an ambient Pomodoro focus room synced with your Streak habit tracker.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#111827] p-1 rounded-xl border border-border dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'opportunities'
                ? 'bg-seagreen-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏆 Hackathons & GSoC
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pomodoro'
                ? 'bg-seagreen-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ⏱️ Study Arena Pomodoro
          </button>
        </div>
      </div>

      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HACKATHONS.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-pinkpurple-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800">
                      {h.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{h.mode}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">{h.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.organizer}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Prize Pool / Stipend:</span>
                      <span className="font-extrabold text-seagreen-600 dark:text-seagreen-400">{h.prizePool}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold mt-1">Timeline:</span>
                      <span className="text-slate-700 dark:text-slate-300">{h.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {h.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-pinkpurple-600 to-purple-700 hover:from-pinkpurple-500 hover:to-purple-600 text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pomodoro' && (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-md text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-seagreen-600 dark:text-seagreen-400 bg-seagreen-50 dark:bg-seagreen-950/60 px-2.5 py-0.5 rounded-full border border-seagreen-200 dark:border-seagreen-800">
              Study Arena & Deep Flow
            </span>
            <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100">
              Focus Timer with Streak Synchronization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completing this session automatically logs 1 habit check-in and rewards +15 XP.
            </p>
          </div>

          {/* Time presets */}
          <div className="flex justify-center gap-2">
            {[25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => resetTimer(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  focusMinutes === mins
                    ? 'bg-seagreen-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          {/* Giant Clock Face */}
          <div className="py-6">
            <div className="w-48 h-48 rounded-full border-4 border-seagreen-500/30 flex items-center justify-center mx-auto shadow-inner bg-slate-50 dark:bg-slate-850">
              <span className="text-5xl font-mono font-black text-navy-900 dark:text-slate-100 tracking-tight">
                {formatTimer()}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => resetTimer(focusMinutes)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all text-white ${
                isTimerRunning
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus Session</span>
                </>
              )}
            </button>
          </div>

          {/* Session counter */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sessions completed today: <strong className="text-navy-900 dark:text-slate-100">{completedSessions}</strong></span>
            <span className="text-seagreen-600 dark:text-seagreen-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" /> Streak Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
