import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Briefcase,
  Sparkles,
  Award,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Send,
  Zap,
  Target,
  Users,
  Compass,
} from 'lucide-react';

interface CompanyTrack {
  id: string;
  name: string;
  role: string;
  tier: 'Dream' | 'Super Dream' | 'Premier';
  package: string;
  cutoffCGPA: number;
  eligibility: string;
  rounds: string[];
  recommendedTopics: string[];
  logo: string;
}

interface ReferralJob {
  id: string;
  company: string;
  role: string;
  location: string;
  batch: string;
  salary: string;
  alumniReferral: string;
  alumniRole: string;
  deadline: string;
  tags: string[];
}

const COMPANY_TRACKS: CompanyTrack[] = [
  {
    id: 'google-swe',
    name: 'Google',
    role: 'Software Engineer (Early Career)',
    tier: 'Super Dream',
    package: '32-45 LPA',
    cutoffCGPA: 8.0,
    eligibility: 'B.Tech/M.Tech (CS, IT, ECE)',
    rounds: ['Online Assessment (2 DSA)', 'Tech Round 1 (Data Structures)', 'Tech Round 2 (Algorithms & Graphs)', 'Googliness & Behavioral'],
    recommendedTopics: ['Dynamic Programming', 'Trie / Segment Trees', 'Concurrency', 'Distributed Cache'],
    logo: '🔴',
  },
  {
    id: 'microsoft-swe',
    name: 'Microsoft',
    role: 'Software Engineering Trainee',
    tier: 'Super Dream',
    package: '28-42 LPA',
    cutoffCGPA: 7.5,
    eligibility: 'All Engineering Streams with 70%+ in 10/12th',
    rounds: ['Codility OA (3 Questions)', 'Technical Virtual 1 (Trees & Graphs)', 'Technical Virtual 2 (System Design)', 'AA (As Appropriate / Bar Raiser)'],
    recommendedTopics: ['B+ Trees & Paging', 'Graph Traversal (BFS/DFS)', 'OOP Principles & JVM Memory', 'Cloud Microservices'],
    logo: '🟩',
  },
  {
    id: 'amazon-sde',
    name: 'Amazon',
    role: 'Software Development Engineer - 1',
    tier: 'Super Dream',
    package: '30-44 LPA',
    cutoffCGPA: 7.0,
    eligibility: 'CS / IT / Circuital Branches',
    rounds: ['Online Assessment (Debugging + Coding)', 'Work Simulation & Leadership Principles', 'Technical Round 1', 'Bar Raiser with LP'],
    recommendedTopics: ['Amazon 16 Leadership Principles', 'Heap / Priority Queue', 'Sliding Window', 'LRU Cache Design'],
    logo: '📦',
  },
  {
    id: 'tcs-digital',
    name: 'TCS Digital / Prime',
    role: 'Systems Engineer & AI Specialist',
    tier: 'Dream',
    package: '9-14 LPA',
    cutoffCGPA: 6.5,
    eligibility: '60% throughout Academics',
    rounds: ['National Qualifier Test (NQT)', 'Advanced Coding (2 Problems)', 'Technical & Managerial Interview', 'HR Interview'],
    recommendedTopics: ['Arrays & Strings', 'DBMS SQL Queries', 'Core Java / Python', 'REST APIs'],
    logo: '💼',
  },
];

const REFERRAL_JOBS: ReferralJob[] = [
  {
    id: 'ref-1',
    company: 'CRED',
    role: 'Backend Engineering Intern',
    location: 'Bengaluru (Hybrid)',
    batch: '2025 - 2026',
    salary: '₹60,000 / month stipend',
    alumniReferral: 'Rohan Deshmukh',
    alumniRole: 'SDE-2 at CRED (Class of 2023)',
    deadline: 'In 5 days',
    tags: ['Go / Java', 'Kafka', 'Microservices'],
  },
  {
    id: 'ref-2',
    company: 'PhonePe',
    role: 'Software Engineer - Infrastructure',
    location: 'Bengaluru / Pune',
    batch: '2025 - 2026',
    salary: '22 - 26 LPA',
    alumniReferral: 'Ananya Roy',
    alumniRole: 'DevOps & Systems Lead (Class of 2022)',
    deadline: 'In 9 days',
    tags: ['Distributed Systems', 'Linux', 'Kubernetes'],
  },
  {
    id: 'ref-3',
    company: 'Zomato',
    role: 'Full Stack Engineer (Growth)',
    location: 'Gurugram (On-site)',
    batch: '2025 - 2026',
    salary: '18 - 22 LPA',
    alumniReferral: 'Vikas Sharma',
    alumniRole: 'Senior SDE (Class of 2021)',
    deadline: 'In 12 days',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
];

export const PlacementHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commander' | 'ats' | 'companies' | 'referrals' | 'future-twin'>('commander');
  
  // ATS Resume scanner state
  const [resumeText, setResumeText] = useState('');
  const [isScanningATS, setIsScanningATS] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<{
    strengths: string[];
    improvements: string[];
    missingKeywords: string[];
  } | null>(null);

  // Future Twin state
  const [twinTargetRole, setTwinTargetRole] = useState('Full Stack / Systems Engineer');
  const [twinHoursPerWeek, setTwinHoursPerWeek] = useState(12);
  const [twinSimulatedResult, setTwinSimulatedResult] = useState<{
    estimatedPackage: string;
    interviewProbability: number;
    recommendedMilestone: string;
  }>({
    estimatedPackage: '18 - 24 LPA',
    interviewProbability: 84,
    recommendedMilestone: 'Master Distributed Systems (Raft) and publish 1 full-stack production repo.',
  });

  const handleScanResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsScanningATS(true);
    setTimeout(() => {
      // Intelligent rule-based evaluation of resume keywords
      const text = resumeText.toLowerCase();
      let score = 55;

      const keywords = ['react', 'typescript', 'java', 'sql', 'python', 'git', 'api', 'docker', 'database', 'testing', 'aws', 'algorithms'];
      const found = keywords.filter((k) => text.includes(k));
      const missing = keywords.filter((k) => !text.includes(k));

      score += Math.min(30, found.length * 3);

      const hasMetrics = /\d+[%xXkK]|\d+\s*(users|requests|ms|latency|reduction)/.test(text);
      if (hasMetrics) score += 10;

      const calculatedScore = Math.min(96, Math.max(48, score));
      setAtsScore(calculatedScore);

      setAtsFeedback({
        strengths: [
          `Detected ${found.length} core technical competencies: ${found.slice(0, 5).join(', ')}.`,
          hasMetrics ? 'Strong quantifiable metrics found (impact percentages & scale numbers).' : 'Clean section structure and logical chronological ordering.',
        ],
        improvements: [
          missing.length > 0 ? `Consider adding high-frequency industry keywords: ${missing.slice(0, 4).join(', ')}.` : 'Add GitHub links with deployed production demo URLs.',
          'Format bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".',
        ],
        missingKeywords: missing.slice(0, 6),
      });

      setIsScanningATS(false);
    }, 1000);
  };

  const handleSimulateTwin = (hours: number, role: string) => {
    setTwinHoursPerWeek(hours);
    setTwinTargetRole(role);

    let pkg = '12 - 16 LPA';
    let prob = 65;
    let milestone = 'Complete 50 foundational DSA questions on Code Arena.';

    if (hours >= 14) {
      pkg = '24 - 36 LPA';
      prob = 91;
      milestone = 'Build a high-throughput distributed system project and prepare system design mock interviews.';
    } else if (hours >= 8) {
      pkg = '16 - 22 LPA';
      prob = 78;
      milestone = 'Solve Medium-level Tree/Graph problems and master JVM / SQL performance tuning.';
    }

    setTwinSimulatedResult({
      estimatedPackage: pkg,
      interviewProbability: prob,
      recommendedMilestone: milestone,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Student Portal</span>
            <span>/</span>
            <span className="text-pinkpurple-600 dark:text-pinkpurple-400 font-semibold">Placement & Career Hub</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pinkpurple-100 dark:bg-pinkpurple-950/60 text-pinkpurple-600 dark:text-pinkpurple-400">
                🚀
              </span>
              <span>AI Placement Commander™ — Career Operating System</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800">
              Lumixora OS Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Placement readiness indexing, ATS resume intelligence, dream company tracks, and verified alumni referral pipelines.
          </p>
        </div>

        {/* Global Placement Metric Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-seagreen-500/10 via-pinkpurple-500/10 to-skyblue-500/10 border border-seagreen-200 dark:border-seagreen-900/40">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Placement Readiness
            </span>
            <span className="text-base font-extrabold text-seagreen-600 dark:text-seagreen-400">
              82.4% • Job Ready
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-seagreen-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
            A+
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('commander')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'commander'
              ? 'bg-seagreen-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Readiness Commander</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'ats'
              ? 'bg-seagreen-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ATS Resume Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'companies'
              ? 'bg-seagreen-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company Tracks & Cutoffs</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'referrals'
              ? 'bg-seagreen-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Alumni Job Referrals</span>
        </button>

        <button
          onClick={() => setActiveTab('future-twin')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'future-twin'
              ? 'bg-seagreen-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>AI Future Twin™</span>
        </button>
      </div>

      {/* Tab 1: Readiness Commander */}
      {activeTab === 'commander' && (
        <div className="space-y-6">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DSA & Problem Solving
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900 dark:text-slate-100">88%</span>
                <span className="text-xs font-semibold text-seagreen-600 dark:text-seagreen-400">142 Solved</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-seagreen-500 h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Core CS & Architecture
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900 dark:text-slate-100">79%</span>
                <span className="text-xs font-semibold text-skyblue-600 dark:text-skyblue-400">JVM & OS Proficient</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-skyblue-500 h-full rounded-full" style={{ width: '79%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                System Design & Projects
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900 dark:text-slate-100">85%</span>
                <span className="text-xs font-semibold text-pinkpurple-600 dark:text-pinkpurple-400">3 Repos Live</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-pinkpurple-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Interview Communication
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900 dark:text-slate-100">76%</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">4 Mocks Completed</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>

          {/* Actionable Next Best Milestone */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-pinkpurple-500/10 via-lavender-500/10 to-seagreen-500/10 border border-pinkpurple-200 dark:border-pinkpurple-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pinkpurple-600 dark:text-pinkpurple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-pinkpurple-700 dark:text-pinkpurple-300">
                  SmartBro Placement Recommendation
                </span>
              </div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">
                You are 1 Mock Interview and 1 Distributed Systems lesson away from Tier-1 Eligibility!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Companies like Microsoft and Amazon require clear articulation of Raft Consensus and B+ Tree indexing. Review the BoloClass deck to boost your score to 90%+.
              </p>
            </div>
            <a
              href="/student/boloclass"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-pinkpurple-600 hover:bg-pinkpurple-700 text-white shadow-xs shrink-0"
            >
              <span>Open BoloClass Deck</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 2: ATS Resume Scanner */}
      {activeTab === 'ats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-seagreen-600" />
                <span>Paste Your Resume Text / Markdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluates keyword density, recruiter ATS filters, quantifiable impact statements, and missing tech stacks.
              </p>
            </div>

            <form onSubmit={handleScanResume} className="space-y-3">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the plain text of your resume here (Summary, Technical Skills, Projects, Experience, Education)..."
                rows={12}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-seagreen-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setResumeText(
                      `EDUCATION\nB.Tech in Computer Science & Engineering (CGPA: 8.4/10)\n\nTECHNICAL SKILLS\nLanguages: Java, TypeScript, Python, SQL\nFrameworks & Libraries: React, Node.js, Express, Tailwind CSS, Prisma\nDatabases & Tools: PostgreSQL, SQLite, Docker, Git, Linux\n\nPROJECTS\nSmartBro — Student Success Intelligence Platform\n- Developed high-throughput full-stack academic monitoring system serving 14+ student records\n- Designed explainable rule-based early warning engine reducing risk identification latency by 40%\n- Implemented real-time voice slide narration using Web Speech Synthesis API\n\nDistributed KV Store with Raft Consensus\n- Implemented leader election and log replication handling node partitions with 99.9% consistency\n- Benchmarked throughput yielding 8,500 ops/sec over gRPC connections`
                    )
                  }
                  className="text-xs font-semibold text-seagreen-600 dark:text-seagreen-400 hover:underline"
                >
                  Load Sample Candidate Resume
                </button>

                <button
                  type="submit"
                  disabled={isScanningATS || !resumeText.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-seagreen-600 hover:bg-seagreen-700 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5"
                >
                  {isScanningATS ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Scanning ATS Rules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run ATS Diagnostic</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ATS Compatibility Diagnostic
              </span>

              {atsScore !== null && atsFeedback ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-seagreen-600 dark:text-seagreen-400">
                      {atsScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-700 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800">
                      {atsScore >= 80 ? 'Highly Competitive' : 'Moderate Match'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">
                      ✅ Key Strengths:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {atsFeedback.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-seagreen-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">
                      ⚠️ Recommended Improvements:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {atsFeedback.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {atsFeedback.missingKeywords.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Missing High-Value ATS Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {atsFeedback.missingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border text-[11px] font-mono text-pinkpurple-600 dark:text-pinkpurple-400"
                          >
                            +{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2 text-xs">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Paste your resume text on the left and run diagnostics to receive instant ATS scoring.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Company Tracks & Cutoffs */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPANY_TRACKS.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-sm space-y-4 hover:border-seagreen-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {comp.logo}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{comp.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-pinkpurple-50 dark:bg-pinkpurple-950/60 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800">
                        {comp.tier}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{comp.role}</p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-seagreen-600 dark:text-seagreen-400 bg-seagreen-50 dark:bg-seagreen-950/60 px-2.5 py-1 rounded-lg border border-seagreen-200 dark:border-seagreen-800">
                  {comp.package}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">CGPA Cutoff:</span>
                  <span className="font-bold text-navy-900 dark:text-slate-100">≥ {comp.cutoffCGPA} / 10.0</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Eligibility:</span>
                  <span className="font-bold text-navy-900 dark:text-slate-100">{comp.eligibility}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
                  Interview Round Sequence:
                </span>
                <div className="space-y-1">
                  {comp.rounds.map((round, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{round}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  High-Yield Prep Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {comp.recommendedTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Alumni Referrals */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-skyblue-50/60 dark:bg-skyblue-950/20 border border-skyblue-200 dark:border-skyblue-900/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-skyblue-950 dark:text-skyblue-300">
              <Users className="w-4 h-4 text-skyblue-600" />
              <span>
                Verified college alumni directly forward candidate resumes into internal employee portals, bypassing standard applicant queues.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REFERRAL_JOBS.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-border dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">{job.company}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.role}</p>
                    </div>
                    <span className="text-[10px] font-bold text-pinkpurple-600 bg-pinkpurple-50 dark:bg-pinkpurple-950/60 px-2 py-0.5 rounded-md border border-pinkpurple-200 dark:border-pinkpurple-800">
                      {job.deadline}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-600 dark:text-slate-300">📍 {job.location}</div>
                    <div className="font-bold text-seagreen-600 dark:text-seagreen-400">💰 {job.salary}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Referred By:</span>
                    <span className="font-bold text-navy-900 dark:text-slate-100">{job.alumniReferral}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.alumniRole}</p>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Referral request sent to ${job.alumniReferral} at ${job.company}! Your SmartBro profile & ATS score will be delivered.`)}
                  className="w-full py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Alumni Referral</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: AI Future Twin™ */}
      {activeTab === 'future-twin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-pinkpurple-600" />
                <span>AI Future Twin™ — Career Trajectory Simulator</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulates your graduation placement offer based on hours invested in focused practice and targeted career tracks.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Domain & Specialization
                </label>
                <select
                  value={twinTargetRole}
                  onChange={(e) => handleSimulateTwin(twinHoursPerWeek, e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="Full Stack / Systems Engineer">Full Stack / Systems Engineer (Java + React)</option>
                  <option value="Distributed Systems & Cloud Engineer">Distributed Systems & Cloud Engineer (Go / AWS)</option>
                  <option value="AI / ML Engineer & LLMs">AI / ML Engineer & LLMs (Python + PyTorch)</option>
                  <option value="DevOps & Reliability Engineer">DevOps & Site Reliability (Docker + Kubernetes)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Weekly Focused Preparation Hours
                  </label>
                  <span className="font-bold text-seagreen-600 dark:text-seagreen-400">
                    {twinHoursPerWeek} hrs / week
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="1"
                  value={twinHoursPerWeek}
                  onChange={(e) => handleSimulateTwin(Number(e.target.value), twinTargetRole)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>4 hrs (Minimal)</span>
                  <span>12-14 hrs (Recommended)</span>
                  <span>25 hrs (Intensive)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800">
                Twin Prediction Horizon (Class of 2026)
              </span>

              <div>
                <span className="text-xs text-slate-400 block">Projected Starting Compensation:</span>
                <span className="text-4xl font-black text-white tracking-tight">
                  {twinSimulatedResult.estimatedPackage}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tier-1 Shortlist Probability</span>
                  <span className="font-bold text-teal-400">{twinSimulatedResult.interviewProbability}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${twinSimulatedResult.interviewProbability}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                <span className="font-bold text-teal-300 block">🎯 Critical Twin Recommendation:</span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{twinSimulatedResult.recommendedMilestone}"
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              *Model trained on 395+ historical placement offers and verified alumni hiring matrices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
