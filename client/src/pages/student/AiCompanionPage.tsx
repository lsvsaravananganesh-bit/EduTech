import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { AiChatMessageItem } from '../../types';
import {
  Sparkles,
  Send,
  Calendar,
  Flame,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle2,
  Smile,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GeneratedPlan {
  totalWeeklyMinutes: number;
  schedule: Array<{
    day: string;
    subject: string;
    durationMinutes: number;
    priority: string;
    recommendedActivity: string;
    milestoneGoal: string;
  }>;
  encouragement: string;
}

export const AiCompanionPage: React.FC = () => {
  const [messages, setMessages] = useState<AiChatMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [planHours, setPlanHours] = useState(4);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'planner'>('chat');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const res = await api.ai.getHistory();
      if (res.success && res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Welcoming initial prompt if no history
        setMessages([
          {
            id: 'init-1',
            sender: 'SMARTBRO',
            message:
              "Hey bro! I'm SmartBro, your academic partner and study friend. Whether you want to break down a difficult topic, figure out why a test felt hard, rebuild your study streak, or just set an easy 3-day recovery plan—I'm in your corner. No judgment, no stress. What's on your mind today?",
            suggestedActions: [
              'Help me break down my weakest subject',
              'Create a 3-day recovery study plan',
              'I missed study days and feel behind',
              'How can I prepare for upcoming tests?',
            ],
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setMessages([
        {
          id: 'init-fallback',
          sender: 'SMARTBRO',
          message:
            "Hey bro! I'm ready to help you plan your study sessions and tackle your courses. What subject do you want to look at today?",
          suggestedActions: [
            'Help me break down my weakest subject',
            'Create a 3-day recovery study plan',
          ],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    const tempUserMsg: AiChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.ai.chat(text);
      if (res.success) {
        const smartBroMsg: AiChatMessageItem = {
          id: res.replyId || `bro-${Date.now()}`,
          sender: 'SMARTBRO',
          message: res.message,
          suggestedActions: res.suggestedActions || [],
          createdAt: res.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, smartBroMsg]);
      }
    } catch (err: any) {
      const errorMsg: AiChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'SMARTBRO',
        message:
          "I had a brief hiccup connecting with the study database, bro! But don't worry: take a breath, review your recent chapter notes, and let's try again in a second.",
        suggestedActions: ['Try again', 'Create a 3-day study plan'],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await api.ai.generatePlan(planHours);
      if (res.success && res.data) {
        setGeneratedPlan(res.data);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/student/dashboard" className="hover:text-seagreen-600 dark:hover:text-seagreen-400">
              Student Portal
            </Link>
            <span>/</span>
            <span>SmartBro AI Study Friend</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-seagreen-600 dark:text-seagreen-400" />
              SmartBro — Your Academic Companion
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-700 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800">
              Grounded AI
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Honest, supportive guidance tuned to your actual coursework, grades, and study habits. No judgment, ever.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <Link
            to="/student/streak"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Streak Journey</span>
          </Link>
          <button
            onClick={() => {
              setActiveTab('planner');
              if (!generatedPlan) handleGeneratePlan();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-skyblue-50 dark:bg-skyblue-950/40 text-skyblue-800 dark:text-skyblue-300 border border-skyblue-200 dark:border-skyblue-800/60 hover:bg-skyblue-100 dark:hover:bg-skyblue-900/40 transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-skyblue-600 dark:text-skyblue-400" />
            <span>Study Plan Generator</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Chat with SmartBro</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('planner');
            if (!generatedPlan) handleGeneratePlan();
          }}
          className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'planner'
              ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3-Day Micro Study Planner</span>
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Column (3 cols) */}
          <div className="lg:col-span-3 flex flex-col h-[650px] bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Chat Banner */}
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-border dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-seagreen-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SB
                </div>
                <div>
                  <div className="text-xs font-semibold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                    SmartBro Active
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                    Tuned to your enrolled subjects & assessment trends
                  </p>
                </div>
              </div>

              <button
                onClick={loadChatHistory}
                title="Refresh chat history"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-[#0B0F19]/50">
              {initialLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-seagreen-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Catching up with SmartBro...</span>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isBro = msg.sender === 'SMARTBRO';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBro ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        {isBro && (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-seagreen-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                            SB
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isBro
                              ? 'bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700 text-navy-900 dark:text-slate-100 shadow-xs'
                              : 'bg-gradient-to-r from-seagreen-600 to-teal-700 text-white rounded-br-none shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.message}</div>
                          <div
                            className={`text-[10px] mt-1.5 font-medium ${
                              isBro ? 'text-slate-400 dark:text-slate-400 text-left' : 'text-teal-100 text-right'
                            }`}
                          >
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Suggested actions chips */}
                      {isBro && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="mt-2 ml-10 flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(action)}
                              className="text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-seagreen-50 dark:hover:bg-slate-700 text-navy-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-2xs hover:border-seagreen-400"
                            >
                              <span>{action}</span>
                              <ArrowRight className="w-3 h-3 text-seagreen-600 dark:text-seagreen-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-seagreen-600 to-teal-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    SB
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-white dark:bg-[#1E293B] border border-border dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-seagreen-600 animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-seagreen-600 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-seagreen-600 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    ></span>
                    <span className="ml-1 text-[11px] text-slate-400 dark:text-slate-400">SmartBro is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starters Carousel */}
            <div className="px-3 py-2 bg-slate-50/90 dark:bg-slate-800/90 border-t border-border dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
              <span className="text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Quick:
              </span>
              <button
                onClick={() => handleSendMessage('Break down my weakest subject step by step')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-seagreen-400 hover:text-seagreen-700 dark:hover:text-seagreen-300 transition-colors"
              >
                📊 Break down weakest subject
              </button>
              <button
                onClick={() => handleSendMessage('I failed my recent assessment, what should I do?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-seagreen-400 hover:text-seagreen-700 dark:hover:text-seagreen-300 transition-colors"
              >
                ❤️ Disappointed with marks
              </button>
              <button
                onClick={() => handleSendMessage('Give me a 3-day recovery micro-routine')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-seagreen-400 hover:text-seagreen-700 dark:hover:text-seagreen-300 transition-colors"
              >
                📅 3-day micro-plan
              </button>
              <button
                onClick={() => handleSendMessage('I broke my study streak, how do I recover?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-seagreen-400 hover:text-seagreen-700 dark:hover:text-seagreen-300 transition-colors"
              >
                🔥 Streak recovery
              </button>
              <button
                onClick={() => handleSendMessage('Give me 2 practice questions with steps')}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-seagreen-400 hover:text-seagreen-700 dark:hover:text-seagreen-300 transition-colors"
              >
                🎯 2 practice questions
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-[#111827] border-t border-border dark:border-slate-800">
              <div className="relative flex items-center">
                <textarea
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask SmartBro anything... (e.g. 'Can you help me understand calculus integrals?' or 'I feel behind')"
                  className="w-full resize-none text-xs rounded-xl border border-border dark:border-slate-700 pl-3 pr-20 py-2.5 focus:outline-none focus:ring-1 focus:ring-seagreen-500 focus:border-seagreen-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="absolute right-2 px-3 py-1.5 bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 px-1">
                <span>Press Enter to send, Shift + Enter for new line</span>
                <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Private to your student account
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Grounded Guidance & Principles (1 col) */}
          <div className="space-y-4">
            {/* Persona Box */}
            <div className="p-4 rounded-xl bg-seagreen-50/60 dark:bg-seagreen-950/20 border border-seagreen-200/80 dark:border-seagreen-900/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-seagreen-700 text-white flex items-center justify-center text-xs font-bold">
                  SB
                </div>
                <h3 className="text-xs font-bold text-seagreen-950 dark:text-seagreen-200">How SmartBro Helps You</h3>
              </div>
              <p className="text-[11px] text-seagreen-900 dark:text-slate-300 leading-relaxed">
                SmartBro is designed as a calm, honest study friend. We believe:
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[11px] text-seagreen-900 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400 shrink-0 mt-0.5" />
                  <span><strong>Small actions win:</strong> 20 focused minutes beat 4 hours of doom-scrolling.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400 shrink-0 mt-0.5" />
                  <span><strong>No shame or guilt:</strong> Low marks are just data showing what topic needs a quick tune-up.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400 shrink-0 mt-0.5" />
                  <span><strong>Streak resilience:</strong> Missed a day? Your previous learning is never lost.</span>
                </li>
              </ul>
            </div>

            {/* Quick Companion Tools */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs">
              <h3 className="text-xs font-bold text-navy-900 dark:text-slate-100 mb-2.5">
                Companion Fast Shortcuts
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSendMessage('Break down my weakest subject step by step')}
                  className="w-full text-left p-2.5 rounded-lg border border-border dark:border-slate-800 hover:border-seagreen-300 dark:hover:border-seagreen-700 hover:bg-seagreen-50/30 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="text-xs font-semibold text-navy-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Weak Topic Diagnosis</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Isolate which concepts to revise first
                  </p>
                </button>

                <button
                  onClick={() => handleSendMessage('How can I prepare for upcoming tests without stress?')}
                  className="w-full text-left p-2.5 rounded-lg border border-border dark:border-slate-800 hover:border-seagreen-300 dark:hover:border-seagreen-700 hover:bg-seagreen-50/30 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="text-xs font-semibold text-navy-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Exam Anxiety Triage</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Structure study blocks to reduce panic
                  </p>
                </button>

                <Link
                  to="/student/streak"
                  className="block p-2.5 rounded-lg border border-border dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors"
                >
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Log Today's Study Session
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400/80 mt-0.5">
                    Maintain your streak checkpoints
                  </p>
                </Link>
              </div>
            </div>

            {/* Academic Safety Note */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Academic Note:</span> SmartBro offers guidance and study strategies grounded in your academic record. For formal grade appeals or accommodation requests, please consult your course teacher.
            </div>
          </div>
        </div>
      ) : (
        /* Planner Tab */
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100">
                Grounded 3-to-5 Day Micro Study Planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell SmartBro how many hours you have to study this week. He will calculate a balanced daily schedule prioritizing subjects that need recovery while protecting your strong subjects.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Available Weekly Study Time:</span>
                    <span className="font-semibold text-seagreen-700 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/60 px-2 py-0.5 rounded-md border border-seagreen-200 dark:border-seagreen-800">
                      {planHours} hours / week ({(planHours * 60) / 5} mins/day)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    step="1"
                    value={planHours}
                    onChange={(e) => setPlanHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seagreen-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>2 hrs (Light pace)</span>
                    <span>8 hrs (Moderate)</span>
                    <span>14 hrs (Intensive)</span>
                  </div>
                </div>

                <button
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="px-4 py-2 bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-xs"
                >
                  {generatingPlan ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Calculating Micro-Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Personalized Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Plan Display */}
          {generatedPlan && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold">Plan Ready!</span> {generatedPlan.encouragement}
                </div>
                <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {generatedPlan.totalWeeklyMinutes} Total Minutes Planned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedPlan.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 border bg-white dark:bg-[#111827] flex flex-col justify-between shadow-2xs ${
                      item.priority === 'High'
                        ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-100 dark:ring-amber-950/40'
                        : 'border-border dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {item.day}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.priority === 'High'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.priority === 'High' ? 'Priority Focus' : 'Normal Review'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">{item.subject}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-seagreen-700 dark:text-seagreen-400 font-semibold mt-1">
                        <Clock className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" />
                        <span>{item.durationMinutes} minutes dedicated</span>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 block text-[11px] mb-0.5">
                          Recommended Activity:
                        </span>
                        {item.recommendedActivity}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Goal: {item.milestoneGoal}</span>
                      <Link
                        to="/student/streak"
                        className="text-seagreen-700 dark:text-seagreen-400 font-semibold hover:underline text-[11px] flex items-center gap-1"
                      >
                        Log Now <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
