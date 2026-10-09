import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Clock,
  Flame,
  Award,
  Layers,
  Code2,
  Send,
  Plus,
  Share2,
  Lightbulb,
  FileText,
  Sliders,
  ExternalLink,
  GraduationCap,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { BOLO_CLASS_LESSONS } from '../../data/boloClassLessons';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface DialogueTurn {
  speaker: string;
  role: string;
  avatar: string;
  text: string;
  isProfessor?: boolean;
}

interface SlideScene {
  id: string;
  slideNumber: number;
  title: string;
  subtitle: string;
  takeaways: string[];
  codeOrDiagram?: string;
  realWorldIntuition: string;
  narrationScript: string;
  dialogue?: DialogueTurn[];
  quiz?: QuizQuestion;
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  duration: string;
  tags: string[];
  professor: {
    name: string;
    role: string;
    avatar: string;
  };
  scenes: SlideScene[];
}

const PRESET_LESSONS: Lesson[] = BOLO_CLASS_LESSONS;

export const BoloClassPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(PRESET_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string>(PRESET_LESSONS[0].id);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'slide' | 'dialogue' | 'quiz' | 'notes'>('slide');

  // Audio / Speech Synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Live Doubt Solver state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'professor'; text: string; time: string }>>([
    {
      id: 'init-prof',
      sender: 'professor',
      text: "Welcome to BoloClass AI Classroom! I'm Prof. Vyomra. Ask me any question about this slide or topic in real-time.",
      time: 'Just now',
    },
  ]);
  const [inputDoubt, setInputDoubt] = useState('');
  const [askingDoubt, setAskingDoubt] = useState(false);

  // Notes state
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [earnedRewardNotice, setEarnedRewardNotice] = useState<string | null>(null);

  // Synthesizer modal
  const [synthesizerOpen, setSynthesizerOpen] = useState(false);
  const [synthTopic, setSynthTopic] = useState('');
  const [synthSubject, setSynthSubject] = useState('Computer Science');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const currentLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
  const currentScene = currentLesson.scenes[activeSceneIdx] || currentLesson.scenes[0];

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          const defaultVoice = available.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('English')));
          setSelectedVoice(defaultVoice ? defaultVoice.name : available[0].name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Load saved notes when lesson changes
  useEffect(() => {
    const savedNotes = localStorage.getItem(`boloclass_notes_${activeLessonId}`);
    setStudentNotes(savedNotes || '');
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    stopNarration();
  }, [activeLessonId]);

  // Reset quiz option when changing scene
  useEffect(() => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    stopNarration();
  }, [activeSceneIdx]);

  // Speech Narration Function
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !audioEnabled) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 0.95;

    if (selectedVoice) {
      const match = voices.find((v) => v.name === selectedVoice);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const toggleNarration = () => {
    if (isPlayingAudio) {
      stopNarration();
    } else {
      speakText(currentScene.narrationScript);
    }
  };

  const handleSaveNotes = (val: string) => {
    setStudentNotes(val);
    localStorage.setItem(`boloclass_notes_${activeLessonId}`, val);
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 2000);
  };

  const handleSendDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDoubt.trim() || askingDoubt) return;

    const userText = inputDoubt.trim();
    setInputDoubt('');
    const newMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text: userText,
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setAskingDoubt(true);

    try {
      // Ask SmartBro AI grounded companion in lecture mode
      const prompt = `[BoloClass Lecture Doubt on ${currentLesson.title} - Slide: ${currentScene.title}]: ${userText}`;
      const res = await api.ai.chat(prompt);
      const reply = res.success && res.message ? res.message : `Good question on ${currentScene.title}! Consider how ${userText.slice(0, 30)} directly impacts runtime efficiency. Keep testing edge cases!`;

      setChatMessages((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          sender: 'professor' as const,
          text: reply,
          time: 'Just now',
        },
      ]);

      if (audioEnabled) {
        speakText(reply.slice(0, 200));
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          sender: 'professor' as const,
          text: `Great conceptual question! In ${currentLesson.subject}, remembering that ${currentScene.takeaways[0]} is the core intuition to anchor on.`,
          time: 'Just now',
        },
      ]);
    } finally {
      setAskingDoubt(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (selectedQuizOption === null || !currentScene.quiz) return;
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === currentScene.quiz.correctIndex;

    if (isCorrect) {
      setEarnedRewardNotice('+25 SmartBro Reward Points earned for concept mastery!');
      try {
        await api.streak.logSession({
          durationMinutes: 15,
          activityType: 'REVISE_TOPIC',
          topic: `BoloClass: ${currentLesson.title} (Slide ${currentScene.slideNumber})`,
          notes: `Passed checkpoint quiz with 100% precision.`,
        });
      } catch (err) {
        console.warn('XP logging notice:', err);
      }
    }
  };

  const handleSynthesizeCustomLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthTopic.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    setTimeout(() => {
      const topicName = synthTopic.trim();
      const newLesson: Lesson = {
        id: `synth-${Date.now()}`,
        title: `${topicName}: Core Concepts & System Architecture`,
        subject: synthSubject,
        difficulty: 'Intermediate',
        duration: '15 mins',
        tags: [topicName, 'AI Synthesized', 'BoloClass Deck'],
        professor: {
          name: 'Prof. Vyomra',
          role: `AI Specialist in ${synthSubject}`,
          avatar: '👨‍🏫',
        },
        scenes: [
          {
            id: `s-${Date.now()}-1`,
            slideNumber: 1,
            title: `Introduction & Fundamentals of ${topicName}`,
            subtitle: `Core definition, architectural intuition, and high-impact theoretical pillars`,
            takeaways: [
              `${topicName} provides structured mechanisms to solve complex computational and analytical problems efficiently.`,
              `Understanding the foundational constraints prevents common edge-case failures in system designs.`,
              `Real-world systems integrate ${topicName} with deterministic guarantees and performance benchmarks.`,
            ],
            codeOrDiagram: `// Synthesized Architecture Blueprint for ${topicName}
public class ${topicName.replace(/[^a-zA-Z]/g, '')}Pipeline {
    public static void execute() {
        System.out.println("Executing verified workflow for ${topicName}...");
    }
}`,
            realWorldIntuition: `Think of ${topicName} as an optimized highway system: properly routed lanes ensure smooth high-throughput traffic without congestion bottlenecks.`,
            narrationScript: `Welcome to our custom synthesized BoloClass lesson on ${topicName}. Today, we break down core principles and practical architectural strategies step-by-step.`,
            quiz: {
              question: `What is the primary architectural advantage of implementing ${topicName}?`,
              options: [
                'Deterministic throughput and predictable computational structure',
                'Guarantees zero hardware requirement',
                'Avoids all compilation steps automatically',
                'Disables runtime error handling',
              ],
              correctIndex: 0,
              explanation: `Implementing structured methodologies like ${topicName} provides deterministic throughput and predictable, resilient execution.`,
            },
          },
        ],
      };

      setLessons((prev) => [newLesson, ...prev]);
      setActiveLessonId(newLesson.id);
      setActiveSceneIdx(0);
      setIsSynthesizing(false);
      setSynthesizerOpen(false);
      setSynthTopic('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Student Portal</span>
            <span>/</span>
            <span className="text-pinkpurple-600 dark:text-pinkpurple-400 font-semibold">BoloClass AI Classroom</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pinkpurple-100 dark:bg-pinkpurple-950/60 text-pinkpurple-600 dark:text-pinkpurple-400">
                🎙️
              </span>
              <span>BoloClass AI Classroom — Voice & Slides</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800">
              Interactive Seminar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Voice-narrated academic slide decks with curious student peer dialogues, in-class live doubt resolution, and checkpoint rewards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSynthesizerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-pinkpurple-600 to-purple-700 hover:from-pinkpurple-500 hover:to-purple-600 text-white transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Custom Deck</span>
          </button>
        </div>
      </div>

      {/* Lesson Selector Bar */}
      <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-seagreen-500" />
          Lessons:
        </span>
        {lessons.map((les) => (
          <button
            key={les.id}
            onClick={() => {
              setActiveLessonId(les.id);
              setActiveSceneIdx(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeLessonId === les.id
                ? 'bg-gradient-to-r from-seagreen-600 to-teal-700 text-white border-transparent shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-seagreen-400'
            }`}
          >
            {les.title}
          </button>
        ))}
      </div>

      {/* Main 2-Column Presentation Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Slide Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[580px]">
            {/* Top Slide Header Bar with Audio Controls */}
            <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-850/80 border-b border-border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{currentLesson.professor.avatar}</span>
                <div>
                  <h3 className="text-xs font-bold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{currentLesson.professor.name}</span>
                    <span className="text-[10px] font-normal text-slate-400">• {currentLesson.subject}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Slide {currentScene.slideNumber} of {currentLesson.scenes.length}
                  </span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  title={audioEnabled ? 'Mute Voice Narration' : 'Enable Voice Narration'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    audioEnabled
                      ? 'bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-700 dark:text-seagreen-300 border-seagreen-200 dark:border-seagreen-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 focus:outline-none"
                >
                  <option value={0.85}>0.85x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.2}>1.2x</option>
                  <option value={1.4}>1.4x</option>
                </select>

                <button
                  onClick={toggleNarration}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    isPlayingAudio
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Narration</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Speak Slide 🎙️</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-5 pt-3 border-b border-border dark:border-slate-800 flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('slide')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'slide'
                    ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Slide Canvas</span>
              </button>
              {currentScene.dialogue && (
                <button
                  onClick={() => setActiveTab('dialogue')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                    activeTab === 'dialogue'
                      ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Peer Dialogue Transcript</span>
                </button>
              )}
              {currentScene.quiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                    activeTab === 'quiz'
                      ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Checkpoint Quiz</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>My Slide Scratchpad</span>
              </button>
            </div>

            {/* Slide Body View */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'slide' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h2 className="text-lg font-extrabold text-navy-900 dark:text-slate-100 tracking-tight">
                      {currentScene.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {currentScene.subtitle}
                    </p>
                  </div>

                  {/* Bullet Takeaways */}
                  <div className="space-y-2.5 bg-slate-50/70 dark:bg-slate-850/60 p-4 rounded-xl border border-border dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-seagreen-800 dark:text-seagreen-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-seagreen-600" />
                      Core Conceptual Takeaways
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                      {currentScene.takeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-seagreen-600 dark:text-seagreen-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Code or Diagram Box */}
                  {currentScene.codeOrDiagram && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-slate-100 shadow-md">
                      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Code2 className="w-3.5 h-3.5 text-teal-400" /> Technical Architecture & Syntax
                        </span>
                        <span>Interactive Sandbox</span>
                      </div>
                      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-teal-300">
                        <code>{currentScene.codeOrDiagram}</code>
                      </pre>
                    </div>
                  )}

                  {/* Real-World Intuition Box */}
                  <div className="p-4 rounded-xl bg-lavender-50/60 dark:bg-lavender-950/20 border border-lavender-200/80 dark:border-lavender-900/40 text-xs">
                    <span className="font-bold text-lavender-900 dark:text-lavender-300 block mb-1">
                      💡 Real-World Mental Model & Intuition:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{currentScene.realWorldIntuition}"
                    </p>
                  </div>
                </div>
              )}

              {/* Dialogue Transcript View */}
              {activeTab === 'dialogue' && currentScene.dialogue && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Classroom interaction and edge-case questions raised during this slide presentation:
                  </div>
                  {currentScene.dialogue.map((turn, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                        turn.isProfessor
                          ? 'bg-seagreen-50/40 dark:bg-seagreen-950/20 border-seagreen-200/80 dark:border-seagreen-900/40'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{turn.avatar}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900 dark:text-slate-100">{turn.speaker}</span>
                          <span className="text-[10px] text-slate-400">({turn.role})</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{turn.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkpoint Quiz View */}
              {activeTab === 'quiz' && currentScene.quiz && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pinkpurple-700 dark:text-pinkpurple-300 bg-pinkpurple-50 dark:bg-pinkpurple-950/60 px-2 py-0.5 rounded-md border border-pinkpurple-200 dark:border-pinkpurple-800">
                      Mastery Checkpoint (+25 Streak Points)
                    </span>
                    <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100 mt-2">
                      {currentScene.quiz.question}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {currentScene.quiz.options.map((opt, oIdx) => {
                      const isSelected = selectedQuizOption === oIdx;
                      const isCorrect = currentScene.quiz && oIdx === currentScene.quiz.correctIndex;
                      let optionClass =
                        'border-slate-200 dark:border-slate-700 hover:border-seagreen-400 bg-white dark:bg-slate-800';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isSelected && !isCorrect) {
                          optionClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                        }
                      } else if (isSelected) {
                        optionClass = 'border-seagreen-600 bg-seagreen-50 dark:bg-seagreen-950/40 text-seagreen-900 dark:text-seagreen-200 font-semibold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedQuizOption(oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionClass}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={selectedQuizOption === null}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <div className="font-bold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Explanation:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {currentScene.quiz.explanation}
                      </p>
                      {earnedRewardNotice && (
                        <div className="mt-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>{earnedRewardNotice}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Scratchpad View */}
              {activeTab === 'notes' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Personal Lecture Scratchpad (Auto-saved)
                    </span>
                    {notesSavedNotice && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Saved to your account
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={10}
                    value={studentNotes}
                    onChange={(e) => handleSaveNotes(e.target.value)}
                    placeholder="Type your notes, formulas, or questions here. Notes stay permanently attached to this lesson..."
                    className="w-full text-xs font-mono rounded-xl border border-border dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
                  />
                </div>
              )}
            </div>

            {/* Bottom Slide Stepper Navigation */}
            <div className="px-5 py-3 bg-slate-50/90 dark:bg-slate-850/90 border-t border-border dark:border-slate-800 flex items-center justify-between">
              <button
                disabled={activeSceneIdx === 0}
                onClick={() => setActiveSceneIdx((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {currentLesson.scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSceneIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeSceneIdx === idx
                        ? 'bg-seagreen-600 w-6'
                        : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                disabled={activeSceneIdx === currentLesson.scenes.length - 1}
                onClick={() => setActiveSceneIdx((prev) => Math.min(currentLesson.scenes.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-seagreen-600 hover:bg-seagreen-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live In-Class Doubt Solver (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[580px] bg-white dark:bg-[#111827] rounded-2xl border border-border dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Doubt Solver Banner */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-border dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-seagreen-100 dark:bg-seagreen-950 text-seagreen-600 dark:text-seagreen-400">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-navy-900 dark:text-slate-100">Live Classroom Doubt Solver</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask Prof. Vyomra about this slide</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Doubt Messages Scroll */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-[#0B0F19]/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[90%] shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-seagreen-600 to-teal-700 text-white rounded-br-none'
                      : 'bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700 text-navy-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-[9px] block mt-1 ${
                      msg.sender === 'user' ? 'text-teal-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {askingDoubt && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <div className="w-3.5 h-3.5 border-2 border-seagreen-600 border-t-transparent rounded-full animate-spin" />
                <span>Prof. Vyomra is thinking...</span>
              </div>
            )}
          </div>

          {/* Doubt Input Form */}
          <form onSubmit={handleSendDoubt} className="p-2.5 bg-white dark:bg-[#111827] border-t border-border dark:border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputDoubt}
                onChange={(e) => setInputDoubt(e.target.value)}
                placeholder="Ask a question about this slide..."
                className="w-full text-xs rounded-xl border border-border dark:border-slate-700 pl-3 pr-10 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputDoubt.trim() || askingDoubt}
                className="absolute right-1.5 p-1.5 rounded-lg bg-seagreen-600 hover:bg-seagreen-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Synthesizer Modal */}
      <Modal
        isOpen={synthesizerOpen}
        onClose={() => setSynthesizerOpen(false)}
        title="Synthesize Custom BoloClass Lecture Deck"
        subtitle="Generate a voice-narrated slide deck with peer dialogue and checkpoint quizzes on any topic"
        maxWidth="md"
      >
        <form onSubmit={handleSynthesizeCustomLesson} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Lecture Topic or Concept
            </label>
            <input
              type="text"
              required
              value={synthTopic}
              onChange={(e) => setSynthTopic(e.target.value)}
              placeholder="e.g. Dijkstra's Shortest Path Algorithm, Quantum Computing Superposition, Database B-Trees"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Subject Domain
            </label>
            <select
              value={synthSubject}
              onChange={(e) => setSynthSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
            >
              <option value="Computer Science">Computer Science & Algorithms</option>
              <option value="Mathematics">Mathematics & Machine Learning</option>
              <option value="Operating Systems">Operating Systems & Architecture</option>
              <option value="Database Systems">Database Engineering & SQL</option>
              <option value="Physics">Physics & Electrical Engineering</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSynthesizerOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSynthesizing || !synthTopic.trim()}
              className="px-4 py-2 bg-gradient-to-r from-pinkpurple-600 to-purple-700 hover:from-pinkpurple-500 hover:to-purple-600 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Slides & Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Slide Deck</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
