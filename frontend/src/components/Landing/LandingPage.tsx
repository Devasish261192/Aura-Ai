import React, { useState } from 'react';
import {
  Sparkles,
  GitFork,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Shield,
  Star,
  Zap,
  Compass,
  PlayCircle,
  X,
  Brain,
  Video,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrency, formatCompensation } from '../../utils/currency';
import type { AuthUser } from '../../types';

interface CareerNode {
  id: string;
  level: string;
  title: string;
  subtitle?: string;
  description: string;
  compRange: string;
  evScore: number;
  skills: string[];
  metricsDelta?: string;
  isChosen?: boolean;
  isTarget?: boolean;
  isAlternate?: boolean;
  details?: {
    overview: string;
    unlockedPathways: string[];
    skillsMastered: Array<{ name: string; score: number; color: string }>;
    counselorAdvice: string;
  };
}

interface CareerTrack {
  id: string;
  name: string;
  badge: string;
  rootNode: CareerNode;
  forkNodes: CareerNode[];
  inclineNode: CareerNode;
  canopyNodes: CareerNode[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'engineering_mgmt',
    name: 'Tech & Engineering Strategy',
    badge: 'Executive Track',
    rootNode: {
      id: 'root_1',
      level: 'Level 01 • Engineering Origin',
      title: 'ROOT: B.Tech Engineering',
      description: 'Engineering baseline. Strong foundation in numerical optimization, kinematics, and algorithmic problem-solving.',
      compRange: '$65k – $78k',
      evScore: 50,
      skills: ['CAD / FEA', 'Calculus III', 'Python Systems', 'Algorithms'],
      isChosen: true,
      details: {
        overview: 'Serves as the rigorous mathematical bedrock for high-agency cross-functional execution.',
        unlockedPathways: ['Core Technical Specialist', 'Technical Product Architect', 'Operations Strategy'],
        skillsMastered: [
          { name: 'Algorithmic Logic', score: 95, color: 'text-cyan-400' },
          { name: 'System Architecture', score: 88, color: 'text-blue-400' },
          { name: 'Quantitative Rigor', score: 92, color: 'text-emerald-400' }
        ],
        counselorAdvice: 'Early technical rigor provides an unbeatable unfair advantage once paired with capital governance.'
      }
    },
    forkNodes: [
      {
        id: 'fork_1a',
        level: 'Fork 2A • Alternate',
        title: 'Direct Industry Plant Job',
        description: 'Jr. Mechanical Design Engineer. Linear domain skill accrual with capped early compensation multiplier.',
        compRange: '$70k – $82k',
        evScore: 58,
        skills: ['On-site CAD', 'Vendor Sourcing', 'Plant Maintenance'],
        isAlternate: true,
        details: {
          overview: 'Traditional linear trajectory. Slower executive pivot due to delayed P&L governance exposure.',
          unlockedPathways: ['Plant Operations Lead', 'Senior Design Engineer'],
          skillsMastered: [
            { name: 'Domain Execution', score: 75, color: 'text-gray-400' },
            { name: 'Commercial P&L', score: 32, color: 'text-rose-400' }
          ],
          counselorAdvice: 'Avoid staying in pure maintenance cycles for >2 years if executive trajectory is the objective.'
        }
      },
      {
        id: 'fork_1b',
        level: 'Fork 2B • Optimal Fork',
        title: 'Top-Tier MBA / Business School',
        subtitle: 'USER CHOSEN OPTIMAL PATH',
        description: '2-year premier MBA focusing on Tech Management, Corporate Strategy & Operations. Bridges engineering rigor with capital governance.',
        compRange: '$140k – $165k',
        evScore: 98,
        metricsDelta: '+180% Comp Delta',
        skills: ['Financial Modeling', 'Corporate Strategy', 'Cross-Functional P&L', 'Executive Negotiation'],
        isChosen: true,
        details: {
          overview: 'The highest expected-value inflection point, translating technical depth into enterprise executive authority.',
          unlockedPathways: ['Global Strategy Lead', 'Enterprise P&L Governance', 'C-Suite Acceleration'],
          skillsMastered: [
            { name: 'Corporate Finance & CapEx', score: 96, color: 'text-cyan-400' },
            { name: 'Strategic Stakeholder Alignment', score: 94, color: 'text-emerald-400' },
            { name: 'Go-to-Market Economics', score: 90, color: 'text-purple-400' }
          ],
          counselorAdvice: 'The MBA multiplies the foundation only when paired with high-ownership operational internships.'
        }
      },
      {
        id: 'fork_1c',
        level: 'Fork 2C • Alternate',
        title: 'MS in Robotics & Systems',
        description: 'Deep technical research track oriented toward advanced lab research and individual contributor engineering.',
        compRange: '$88k – $105k',
        evScore: 64,
        skills: ['ROS Systems', 'Sensor Fusion', 'Embedded C++'],
        isAlternate: true,
        details: {
          overview: 'High technical specialization. Excellent for research labs, but caps broader business unit leadership speed.',
          unlockedPathways: ['Principal Systems Architect', 'R&D Lab Director'],
          skillsMastered: [
            { name: 'Robotics Kinematics', score: 94, color: 'text-cyan-400' },
            { name: 'Enterprise Management', score: 40, color: 'text-amber-400' }
          ],
          counselorAdvice: 'Great for pure tech IP, but requires complementary management credentials later for C-level roles.'
        }
      }
    ],
    inclineNode: {
      id: 'incline_1',
      level: 'Level 03 • Incline Milestone',
      title: 'Sr. Associate Product & Ops Manager',
      description: 'Enterprise SaaS & Logistics scale-up. Synthesizes core technical engineering acumen with business unit governance.',
      compRange: '$160k – $195k + Equity',
      evScore: 94,
      skills: ['Quantitative Financial Modeling', 'Cross-Functional Strategy', 'Executive Communication', 'SLA Recovery'],
      isChosen: true,
      details: {
        overview: 'Crucial bridge role where the candidate manages both technical roadmaps and millions in operational budget.',
        unlockedPathways: ['VP of Operations', 'Chief Operating Officer (COO)', 'Chief Strategy Officer (CSO)'],
        skillsMastered: [
          { name: 'Financial & Capital Modeling', score: 98, color: 'text-emerald-400' },
          { name: 'Cross-Functional Strategy', score: 92, color: 'text-cyan-400' },
          { name: 'Board-Level Communication', score: 90, color: 'text-purple-400' }
        ],
        counselorAdvice: 'Focus relentlessly on metric-backed stories (revenue protected, SLA recovery, headcount velocity) for the canopy leap.'
      }
    },
    canopyNodes: [
      {
        id: 'canopy_1a',
        level: 'Canopy Pivot 4A',
        title: 'Management Consulting Principal',
        description: 'Tier-1 Strategy Practice. Advisory track delivering corporate reorganizations with high travel intensity.',
        compRange: '$210k – $260k',
        evScore: 86,
        skills: ['Executive Advisory', 'Cost Transformation', 'Board Pitching'],
        isAlternate: true
      },
      {
        id: 'canopy_1b',
        level: 'Canopy Pivot 4B • Optimal Leap',
        title: 'VP of Operations & Strategy',
        subtitle: 'TARGET CANOPY DESTINATION',
        description: 'Top canopy executive destination. Unlocked via compounding engineering foundation, elite MBA credential, and operational leadership.',
        compRange: '$240k – $340k + Equity',
        evScore: 96,
        metricsDelta: '$1.85M 5-Yr Compound EV',
        skills: ['Global Operations Command', 'Enterprise Capital Allocation', 'Multi-Division Governance'],
        isChosen: true,
        isTarget: true
      },
      {
        id: 'canopy_1c',
        level: 'Canopy Pivot 4C',
        title: 'DeepTech Co-Founder / COO',
        description: 'Robotics & AI hardware spinout. High reward potential with recommended 2 additional years of capital reserves.',
        compRange: 'Asymmetric Equity Beta',
        evScore: 82,
        skills: ['Seed Fundraising', 'Product Prototyping', 'Equity Governance'],
        isAlternate: true
      },
      {
        id: 'canopy_1d',
        level: 'Canopy Pivot 4D',
        title: 'Head of Enterprise Transformation',
        description: 'Fortune 500 strategic transformation office overseeing multi-million digital workflow re-engineering.',
        compRange: '$220k – $280k',
        evScore: 89,
        skills: ['Change Architecture', 'Enterprise ERP/AI Ops', 'Stakeholder Triage'],
        isAlternate: true
      }
    ]
  },
  {
    id: 'wfm_track',
    name: 'Workforce Management & Ops',
    badge: 'WFM / RTA Track',
    rootNode: {
      id: 'root_wfm',
      level: 'Level 01 • Operations Origin',
      title: 'ROOT: Contact Center Operations Specialist',
      description: 'Foundational front-line operations. Mastery of queue dynamics, SLA compliance, and multi-channel triage.',
      compRange: '₹4.5L – ₹6.5L',
      evScore: 52,
      skills: ['Queue Monitoring', 'SLA Adherence', 'Agent Telephony', 'Excel Metrics'],
      isChosen: true
    },
    forkNodes: [
      {
        id: 'fork_wfm_a',
        level: 'Fork 2A • Alternate',
        title: 'Senior Team Lead (People Mgmt)',
        description: 'Shift supervisor managing agent HR rosters. High attrition coaching with limited mathematical forecasting exposure.',
        compRange: '₹7.5L – ₹9.5L',
        evScore: 60,
        skills: ['1-on-1 Coaching', 'Roster Approvals', 'Disciplinary Handling'],
        isAlternate: true
      },
      {
        id: 'fork_wfm_b',
        level: 'Fork 2B • Optimal Fork',
        title: 'WFM Real-Time Analyst (RTA) & Scheduler',
        subtitle: 'CHOSEN QUANTITATIVE FORK',
        description: 'Transition into algorithmic intraday scheduling, Erlang-C staffing simulations, and Nice/IEX systems.',
        compRange: '₹10L – ₹14L',
        evScore: 97,
        metricsDelta: '+140% Comp Acceleration',
        skills: ['Erlang-C Modeling', 'IEX / Nice WFM', 'Real-Time Adherence (RTA)', 'Variance Root-Cause'],
        isChosen: true
      },
      {
        id: 'fork_wfm_c',
        level: 'Fork 2C • Alternate',
        title: 'Quality Assurance & Audit Specialist',
        description: 'Evaluates call recordings against regulatory compliance checklists. Niche track with limited scale multiplier.',
        compRange: '₹6.5L – ₹8.5L',
        evScore: 56,
        skills: ['Call Scoring', 'Compliance Audits', 'Agent Feedback'],
        isAlternate: true
      }
    ],
    inclineNode: {
      id: 'incline_wfm',
      level: 'Level 03 • Incline Milestone',
      title: 'Senior WFM Operations & Planning Lead',
      description: 'Central command lead governing 2,500+ seat multi-geo operations, shift bidding automation, and client SLA scorecards.',
      compRange: '₹18L – ₹26L',
      evScore: 95,
      skills: ['Cross-Site Capacity Modeling', 'PowerBI WFM Telemetry', 'Shrinkage & Attrition Triage', 'Executive QBRs'],
      isChosen: true
    },
    canopyNodes: [
      {
        id: 'canopy_wfm_a',
        level: 'Canopy Pivot 4A',
        title: 'Director of Capacity Planning & Headcount',
        description: 'Executive headcount forecaster coordinating directly with CFO and VP of HR for 10,000+ global workforce.',
        compRange: '₹35L – ₹48L',
        evScore: 92,
        skills: ['Budget Modeling', 'Executive Forecasts', 'Geo Expansion'],
        isAlternate: true
      },
      {
        id: 'canopy_wfm_b',
        level: 'Canopy Pivot 4B • Optimal Leap',
        title: 'Global Head of Workforce Management & Ops',
        subtitle: 'TARGET CANOPY DESTINATION',
        description: 'Global executive owning 24/7 command center, AI workforce routing, and enterprise vendor SLA agreements.',
        compRange: '₹45L – ₹65L + ESOPs',
        evScore: 98,
        metricsDelta: 'Top 1% Operational Authority',
        skills: ['Global Workforce Governance', 'AI Routing Automation', 'P&L Optimization'],
        isChosen: true,
        isTarget: true
      },
      {
        id: 'canopy_wfm_c',
        level: 'Canopy Pivot 4C',
        title: 'VP of Contact Center Operations',
        description: 'Full delivery executive managing client accounts, site profitability, and regional operations facilities.',
        compRange: '₹40L – ₹55L',
        evScore: 88,
        skills: ['Client Account Governance', 'Site Profitability', 'Contract Negotiation'],
        isAlternate: true
      }
    ]
  },
  {
    id: 'hr_track',
    name: 'Human Resources & Talent Acquisition',
    badge: 'HRBP / Talent Track',
    rootNode: {
      id: 'root_hr',
      level: 'Level 01 • Talent Origin',
      title: 'ROOT: Talent Acquisition Specialist',
      description: 'Full-cycle tech recruitment, applicant tracking systems (ATS), and candidate pipeline sourcing.',
      compRange: '₹5L – ₹7.5L',
      evScore: 50,
      skills: ['LinkedIn Recruiter', 'ATS Pipeline Triage', 'Screening', 'Offer Rolling'],
      isChosen: true
    },
    forkNodes: [
      {
        id: 'fork_hr_a',
        level: 'Fork 2A • Alternate',
        title: 'Agency Sourcing Recruiter',
        description: 'Third-party commission recruiting. High transaction volume with zero internal talent development exposure.',
        compRange: '₹6L – ₹9L',
        evScore: 54,
        skills: ['Commission Sales', 'Cold Calling', 'Volume Screening'],
        isAlternate: true
      },
      {
        id: 'fork_hr_b',
        level: 'Fork 2B • Optimal Fork',
        title: 'HR Business Partner (HRBP) Lead',
        subtitle: 'CHOSEN STRATEGIC FORK',
        description: 'Strategic advisor to VP of Engineering and Product. Leads org design, talent retention, and performance appraisals.',
        compRange: '₹14L – ₹20L',
        evScore: 96,
        metricsDelta: '+160% Comp Acceleration',
        skills: ['Org Design', 'Leadership Coaching', 'Succession Planning', 'Attrition Analytics'],
        isChosen: true
      },
      {
        id: 'fork_hr_c',
        level: 'Fork 2C • Alternate',
        title: 'HR Operations & Payroll Executive',
        description: 'Benefits administration and compliance filings. Stable operational workflow with limited executive exposure.',
        compRange: '₹7L – ₹9.5L',
        evScore: 58,
        skills: ['PF / ESIC Filings', 'Payroll Execution', 'Statutory Compliance'],
        isAlternate: true
      }
    ],
    inclineNode: {
      id: 'incline_hr',
      level: 'Level 03 • Incline Milestone',
      title: 'Head of People Operations & HR Strategy',
      description: 'Oversees company-wide culture, compensation bands, ESOP policies, and scalable people infrastructure.',
      compRange: '₹28L – ₹40L',
      evScore: 94,
      skills: ['Compensation Banding', 'Culture Architecture', 'Leadership Development', 'Workday / Darwinbox'],
      isChosen: true
    },
    canopyNodes: [
      {
        id: 'canopy_hr_a',
        level: 'Canopy Pivot 4A',
        title: 'Executive Search & Advisory Partner',
        description: 'Tier-1 executive recruiter placing C-suite officers into venture-backed scaleups.',
        compRange: '₹50L – ₹70L',
        evScore: 89,
        skills: ['C-Suite Network', 'Equity Advisory', 'Founder Counseling'],
        isAlternate: true
      },
      {
        id: 'canopy_hr_b',
        level: 'Canopy Pivot 4B • Optimal Leap',
        title: 'Chief People Officer (CPO) / VP HR',
        subtitle: 'TARGET CANOPY DESTINATION',
        description: 'Enterprise executive reporting directly to CEO, shaping board talent strategy, global expansions, and M&A integration.',
        compRange: '₹55L – ₹80L + Equity',
        evScore: 97,
        metricsDelta: 'Top Executive Leadership',
        skills: ['Board HR Governance', 'M&A Talent Integration', 'Global Total Rewards'],
        isChosen: true,
        isTarget: true
      },
      {
        id: 'canopy_hr_c',
        level: 'Canopy Pivot 4C',
        title: 'VP of HR Technology & Analytics',
        description: 'Heads enterprise People Analytics and automation platforms across 20,000+ employees.',
        compRange: '₹45L – ₹65L',
        evScore: 91,
        skills: ['People Analytics', 'AI Workflows', 'HR SaaS Architecture'],
        isAlternate: true
      }
    ]
  }
];

const DEFAULT_TESTERS: AuthUser[] = [
  { username: 'user1', name: 'Tester 1: Workforce Management (WFM)', role_track: 'Workforce Management (WFM)', status: 'ASSIGNED', badge: 'WFM / RTA', color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300' },
  { username: 'user2', name: 'Tester 2: HR Business Partner (HRBP)', role_track: 'Human Resources & Talent Acquisition', status: 'ASSIGNED', badge: 'HR / Talent', color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' },
  { username: 'user3', name: 'Tester 3: Management Consulting', role_track: 'Management & Business Consulting', status: 'ASSIGNED', badge: 'Consulting', color: 'border-purple-500/40 bg-purple-950/40 text-purple-300' },
  { username: 'user4', name: 'Tester 4: Application Support Lead', role_track: 'Application Support & Operations', status: 'ASSIGNED', badge: 'App Support', color: 'border-blue-500/40 bg-blue-950/40 text-blue-300' },
  { username: 'user5', name: 'Tester 5: Data & Analytics Lead', role_track: 'Data Engineering & Analytics', status: 'ASSIGNED', badge: 'Data Analytics', color: 'border-amber-500/40 bg-amber-950/40 text-amber-300' },
  ...Array.from({ length: 15 }, (_, i) => {
    const num = i + 6;
    return {
      username: `user${num}`,
      name: `Tester ${num}: Open Slot`,
      role_track: `Open Career Track ${num}`,
      status: 'OPEN' as const,
      badge: 'OPEN',
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
    };
  })
];

export const LandingPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const { login, testers, fetchTesters } = useAppStore();
  const [activeTrackId, setActiveTrackId] = useState<string>('engineering_mgmt');
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);

  // Auth State
  const [authTab, setAuthTab] = useState<'quick' | 'manual'>('quick');
  const [testerFilter, setTesterFilter] = useState<'all' | 'open' | 'assigned'>('all');
  const [usernameInput, setUsernameInput] = useState('user1');
  const [passwordInput, setPasswordInput] = useState('password1234');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currency] = useCurrency();

  React.useEffect(() => {
    fetchTesters();
  }, [fetchTesters]);

  const activeTrack = CAREER_TRACKS.find((t) => t.id === activeTrackId) || CAREER_TRACKS[0];

  const handleQuickLogin = async (username: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const ok = await login(username, 'password1234');
      if (ok && onLoginSuccess) {
        onLoginSuccess();
      } else if (!ok) {
        setAuthError('Authentication failed. Check credentials.');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Error logging in.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const ok = await login(usernameInput.trim().toLowerCase(), passwordInput.trim());
      if (ok && onLoginSuccess) {
        onLoginSuccess();
      } else if (!ok) {
        setAuthError('Invalid credentials. Use test accounts user1–user10 with password1234.');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Error logging in.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const scrollToAuth = () => {
    const el = document.getElementById('auth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f18] text-[#f1f3fd] font-sans antialiased overflow-x-hidden selection:bg-cyan-400 selection:text-black">
      
      {/* ----------------- PERSISTENT TOP NAVIGATION ----------------- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#07090f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400/30 to-purple-500/30 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0c0f18] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-2xl tracking-tight text-white">Aura AI</span>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-cyan-400 border border-cyan-400/30 font-semibold tracking-wider">
                Career Agent v1.0
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 font-headline text-sm font-medium text-gray-400">
            <a href="#simulator" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Trajectory Tree
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#matrix" className="hover:text-white transition-colors">Competency Matrix</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToAuth}
              className="font-headline text-sm font-semibold text-gray-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={scrollToAuth}
              className="font-headline text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Aura Counselor</span>
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- MAIN CONTENT ----------------- */}
      <main className="w-full pt-20">

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 px-6">
          {/* Ambient Glow Gradients */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-cyan-400/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none rounded-full"></div>
          <div className="absolute top-96 right-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Live Agent Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141724] border border-white/10 shadow-md mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono text-xs text-cyan-400 font-semibold tracking-wider uppercase">
                Autonomous Career Coach & Predictive Planner
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-gray-400">Real-Time CV Calculation</span>
            </div>

            <h1 className="font-headline font-bold text-4xl sm:text-6xl text-white tracking-tight leading-[1.15] mb-6">
              Simulate Every Career Choice <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                Before You Make The Jump.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Aura models your background, turns your real experience into structured stories, and charts an interactive career decision tree. See how each role and acquired skill unlocks downstream high-compensation leadership tracks.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                onClick={scrollToSimulator}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-headline font-bold text-sm sm:text-base bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.7)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <GitFork className="w-5 h-5" />
                <span>Explore Interactive Career Tree</span>
              </button>
              <button
                onClick={scrollToAuth}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-headline font-semibold text-sm sm:text-base bg-[#141724] border border-white/10 text-white hover:border-cyan-400/40 hover:bg-[#1b1f30] transition-all cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-cyan-400" />
                <span>Beta Tester Sign In</span>
              </button>
            </div>

            {/* Trust Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4.8M Career Transitions Calibrated</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Dynamic Expected Value (EV) Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Personalized Skill Accrual Tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------- CORE INTERACTIVE CAREER TREE SHOWCASE ----------------- */}
        <section className="max-w-7xl mx-auto px-6 py-12" id="simulator">
          <div className="rounded-3xl bg-[#141724] border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
            
            {/* Header of Tree & Track Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-6 h-6 text-cyan-400" />
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white">
                    Live Decision Branching Simulation
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-medium uppercase tracking-wide">
                    Vertical Growth Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  Upward career projection: Root Foundation → Optimal Chosen Crossroads → Milestone Incline → Canopy Pivot Roles.
                </p>
              </div>

              {/* Archetype / Track Switcher */}
              <div className="flex items-center flex-wrap gap-2">
                {CAREER_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setActiveTrackId(track.id)}
                    className={`px-3 py-1.5 rounded-xl font-headline text-xs font-semibold transition-all border cursor-pointer ${
                      activeTrackId === track.id
                        ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                        : 'bg-[#07090f]/80 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{track.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tree Legend */}
            <div className="flex items-center justify-end gap-6 mb-8 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe]"></span>
                <span className="text-white font-medium">Chosen Optimal Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-800 border border-white/20"></span>
                <span>Dimmed Alternate Fork</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#00f5a0]"></span>
                <span className="text-emerald-300 font-medium">Canopy Target Leap</span>
              </div>
            </div>

            {/* Upward Interactive Decision Tree Container */}
            <div className="relative w-full max-w-5xl mx-auto py-4">
              <div className="flex flex-col-reverse gap-10 relative z-10">

                {/* 1. ROOT LEVEL (Foundation) */}
                <div className="flex flex-col items-center justify-center relative">
                  <div
                    onClick={() => setSelectedNode(activeTrack.rootNode)}
                    className="w-full max-w-md p-6 rounded-2xl bg-[#1b1f30] border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(0,242,254,0.15)] relative group hover:border-cyan-400 transition-all text-center cursor-pointer"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-mono text-[11px] uppercase tracking-wider mb-2 border border-cyan-400/20">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span>{activeTrack.rootNode.level}</span>
                    </div>
                    <h3 className="font-headline font-bold text-xl text-white mb-1.5">
                      {activeTrack.rootNode.title}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mb-3 leading-relaxed">
                      {activeTrack.rootNode.description}
                    </p>
                    <div className="flex items-center justify-center flex-wrap gap-2 font-mono text-[11px] text-gray-400">
                      {activeTrack.rootNode.skills.map((sk) => (
                        <span key={sk} className="px-2.5 py-1 rounded-md bg-[#07090f] border border-white/5">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upward Vertical Stem Connector */}
                  <div className="h-12 w-0.5 bg-gradient-to-t from-cyan-400/50 to-cyan-400 relative my-0">
                    <div className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></div>
                  </div>
                </div>

                {/* 2. FORK LEVEL (Crossroads: Dimmed Alternates vs Glowing Chosen Path) */}
                <div className="relative">
                  <div className="text-center mb-5">
                    <span className="font-mono text-xs text-blue-400 uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20">
                      Level 02 • Decision Crossroads (Upward Radial)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {activeTrack.forkNodes.map((fork) => {
                      const isChosen = fork.isChosen;
                      return (
                        <div
                          key={fork.id}
                          onClick={() => setSelectedNode(fork)}
                          className={`p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-[#1b1f30] border-2 border-cyan-400 glow-cyan relative shadow-xl scale-[1.02]'
                              : 'bg-[#07090f]/90 border border-white/10 dim-node hover:scale-[1.01]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isChosen ? 'bg-cyan-400 text-black flex items-center gap-1' : 'bg-[#141724] text-gray-400'
                                }`}
                              >
                                {isChosen && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>}
                                {isChosen ? 'USER CHOSEN' : fork.level}
                              </span>
                              <span className="font-mono text-xs text-emerald-400 font-bold">
                                EV Score: {fork.evScore}
                              </span>
                            </div>

                            <h4 className={`font-headline font-bold text-base mb-1.5 ${isChosen ? 'text-cyan-300' : 'text-white'}`}>
                              {fork.title}
                            </h4>
                            <p className="text-xs text-gray-400 mb-3.5 leading-relaxed">
                              {fork.description}
                            </p>
                          </div>

                          <div>
                            {fork.metricsDelta && (
                              <div className="p-2.5 rounded-lg bg-[#07090f] text-[11px] font-mono text-gray-300 flex justify-between items-center mb-2 border border-white/5">
                                <span>Comp Leverage:</span>
                                <span className="text-emerald-400 font-bold">{fork.metricsDelta}</span>
                              </div>
                            )}
                            <div className="flex items-center flex-wrap gap-1.5 font-mono text-[10px] text-gray-400 border-t border-white/5 pt-2">
                              {fork.skills.map((sk) => (
                                <span key={sk} className="px-1.5 py-0.5 rounded bg-[#141724] border border-white/5">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Upward Vertical Stem Connector */}
                  <div className="flex justify-center">
                    <div className="h-12 w-0.5 bg-gradient-to-t from-cyan-400 to-blue-400 relative my-0">
                      <div className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_#4facfe]"></div>
                    </div>
                  </div>
                </div>

                {/* 3. INCLINE LEVEL (Promoted Milestone) */}
                <div className="flex flex-col items-center justify-center relative">
                  <div
                    onClick={() => setSelectedNode(activeTrack.inclineNode)}
                    className="w-full max-w-xl p-6 rounded-2xl bg-[#1b1f30] border border-blue-400/40 shadow-xl relative cursor-pointer hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wide">
                          {activeTrack.inclineNode.level}
                        </span>
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          {activeTrack.inclineNode.compRange}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-emerald-400 font-semibold">
                        Fit Score: {activeTrack.inclineNode.evScore}%
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-lg text-white mb-1.5">
                      {activeTrack.inclineNode.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {activeTrack.inclineNode.description}
                    </p>

                    {/* Competency Mastery Breakdown */}
                    <div className="bg-[#07090f] p-3.5 rounded-xl border border-white/5 space-y-2 mb-3">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          + Quantitative Metric Governance
                        </span>
                        <span className="text-emerald-400 font-bold">Mastered (98%)</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          + Cross-Functional Strategy
                        </span>
                        <span className="text-cyan-400 font-bold">Advanced (92%)</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          + Executive Communication & P&L
                        </span>
                        <span className="text-purple-400 font-bold">High Agency (90%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] text-gray-400">
                      <span>Horizon to Canopy Executive Role:</span>
                      <span className="text-cyan-400 font-bold">24–36 Months Projected</span>
                    </div>
                  </div>

                  {/* Upward Vertical Stem Connector */}
                  <div className="h-12 w-0.5 bg-gradient-to-t from-blue-400 to-emerald-400 relative my-0">
                    <div className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#00f5a0]"></div>
                  </div>
                </div>

                {/* 4. CANOPY LEVEL (3-4 Future Pivot Roles User Can Pursue) */}
                <div className="relative">
                  <div className="text-center mb-5">
                    <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20">
                      Level 04 • Top Canopy Executive Destinations (3–4 Future Pivot Roles)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                    {activeTrack.canopyNodes.map((canopy) => {
                      const isTarget = canopy.isTarget;
                      return (
                        <div
                          key={canopy.id}
                          onClick={() => setSelectedNode(canopy)}
                          className={`p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
                            isTarget
                              ? 'bg-[#1b1f30] border-2 border-emerald-400 glow-cyan-strong relative shadow-2xl scale-[1.02]'
                              : 'bg-[#07090f]/90 border border-white/10 dim-node hover:scale-[1.01]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isTarget ? 'bg-emerald-400 text-black flex items-center gap-1' : 'bg-[#141724] text-gray-400'
                                }`}
                              >
                                {isTarget && <Star className="w-3 h-3 fill-black text-black" />}
                                {isTarget ? 'TARGET LEAP' : canopy.level}
                              </span>
                              <span className="font-mono text-xs text-emerald-400 font-bold">
                                {canopy.evScore}% Match
                              </span>
                            </div>

                            <h4 className="font-headline font-bold text-base text-white mb-1">
                              {canopy.title}
                            </h4>
                            <div className="font-mono text-xs font-semibold text-emerald-400 mb-2">
                              {canopy.compRange}
                            </div>
                            <p className="text-xs text-gray-400 mb-3.5 leading-relaxed">
                              {canopy.description}
                            </p>
                          </div>

                          {canopy.metricsDelta && (
                            <div className="p-2 rounded bg-[#07090f] font-mono text-[10px] text-gray-300 flex justify-between border border-white/5">
                              <span>Compound EV:</span>
                              <span className="text-cyan-400 font-bold">{canopy.metricsDelta}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Tree Footer Navigation Callout */}
            <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Vertical Trajectory Tree: Calibrated upward from foundational Root to Canopy leadership.</span>
              </div>
              <button
                onClick={scrollToAuth}
                className="inline-flex items-center gap-1.5 font-headline text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                <span>Simulate your personal career baseline with Aura Counselor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* ----------------- 3-PILLAR "HOW AURA AI WORKS" ----------------- */}
        <section className="max-w-7xl mx-auto px-6 py-20" id="how-it-works">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2 block">
              The Intelligence Architecture
            </span>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white mb-4">
              How Aura Maps and Trains Your Career
            </h2>
            <p className="text-base text-gray-400 leading-relaxed">
              Moving between job roles should not be guesswork. Aura functions as an autonomous copilot that constantly evaluates which decisions unlock maximum optionality and compensation compounding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl bg-[#141724] border border-white/10 hover:border-cyan-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs text-cyan-400 font-semibold uppercase">Step 01</span>
              <h3 className="font-headline font-bold text-xl text-white mt-1 mb-3">
                Conversational Story & Vault Extraction
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ingests your background one point at a time. Turns real-world execution into STAR-structured stories (Situation → Task → Action → Result) and saves them permanently in your career vault.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl bg-[#141724] border border-white/10 hover:border-blue-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs text-blue-400 font-semibold uppercase">Step 02</span>
              <h3 className="font-headline font-bold text-xl text-white mt-1 mb-3">
                Dynamic Decision Branch Simulation
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Evaluates hundreds of potential next steps against macro hiring telemetry and live job postings. Dims stagnant paths and illuminates highest expected-value moves with deduplicated search.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl bg-[#141724] border border-white/10 hover:border-emerald-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">Step 03</span>
              <h3 className="font-headline font-bold text-xl text-white mt-1 mb-3">
                Autonomous Interview Studio & Sparring
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Provides targeted micro-curricula, voice dictation polishing, and 90-second mock video rounds simulating senior hiring executives so you master the skills required for the target node.
              </p>
            </div>
          </div>
        </section>

        {/* ----------------- COMPETENCY ACCRUAL MATRIX ----------------- */}
        <section className="max-w-7xl mx-auto px-6 py-12" id="matrix">
          <div className="rounded-3xl bg-gradient-to-r from-[#141724] to-[#1b1f30] border border-white/10 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5">
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold block mb-2">
                  Value Multiplier Matrix
                </span>
                <h2 className="font-headline font-bold text-3xl text-white mb-4">
                  Every Node Accrues Irreversible Leverage
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  In Aura AI, your career isn't just titles. Each step upgrades your composite capability index, transitioning you from a technical operator into an executive leader.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#07090f] border border-white/5">
                    <div className="font-headline font-bold text-2xl text-cyan-400 mb-1">+240%</div>
                    <div className="text-xs text-gray-400">Average 3-Year Comp Growth</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#07090f] border border-white/5">
                    <div className="font-headline font-bold text-2xl text-emerald-400 mb-1">94.8%</div>
                    <div className="text-xs text-gray-400">Target Role Match Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#07090f]/90 p-6 sm:p-8 rounded-2xl border border-white/5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="font-headline font-bold text-sm text-white">Skill Transformation Breakdown</span>
                  <span className="font-mono text-xs text-cyan-400">Foundation → Executive VP</span>
                </div>

                {/* Skill 1 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-white">Financial & Capital Modeling</span>
                    <span className="text-emerald-400 font-bold">+82% Accrual</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#1b1f30] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full w-[88%]"></div>
                  </div>
                </div>

                {/* Skill 2 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-white">Cross-Functional Strategy & Architecture</span>
                    <span className="text-emerald-400 font-bold">+92% Accrual</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#1b1f30] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-[94%]"></div>
                  </div>
                </div>

                {/* Skill 3 */}
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-white">Board-Level Negotiation & Governance</span>
                    <span className="text-emerald-400 font-bold">+76% Accrual</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#1b1f30] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full w-[84%]"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ----------------- TESTIMONIALS ----------------- */}
        <section className="max-w-7xl mx-auto px-6 py-20" id="testimonials">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold block mb-2">
                Verified Trajectories
              </span>
              <h2 className="font-headline font-bold text-3xl sm:text-4xl text-white">
                Validated By Modern Tech & Ops Leaders
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-[#141724] px-4 py-2 rounded-xl border border-white/5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-mono text-xs text-white font-bold">4.9 / 5.0</span>
              <span className="text-gray-400 font-mono text-xs">(1,240+ Verified Reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#141724] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed mb-6 italic">
                  "Pivoting from Engineering to VP of Strategy was completely opaque until Aura showed me the decision tree delta between an MBA and an MS. In 3 years, I landed the exact leadership role it simulated."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-headline font-bold text-black text-sm">
                  MV
                </div>
                <div>
                  <div className="font-headline font-bold text-sm text-white">Marcus Vance</div>
                  <div className="text-xs text-gray-400">VP of Operations & Strategy</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141724] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed mb-6 italic">
                  "Traditional mentors give anecdotes. Aura gave me an expected value calculation. It simulated three job offers and proved why taking a slightly lower base at a high-velocity scaleup would 3x my compounding."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-headline font-bold text-white text-sm">
                  ER
                </div>
                <div>
                  <div className="font-headline font-bold text-sm text-white">Elena Rostova</div>
                  <div className="text-xs text-gray-400">Head of People Analytics</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141724] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed mb-6 italic">
                  "The trait accumulation tracking is brilliant. It told me exactly which two skills I needed to master before interviewing for a Chief of Staff position. The mock sparring gave me total confidence."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-headline font-bold text-black text-sm">
                  TA
                </div>
                <div>
                  <div className="font-headline font-bold text-sm text-white">Tariq Al-Mansoor</div>
                  <div className="text-xs text-gray-400">Head of Business Operations</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------- BETA TESTER & SIGN IN CONVERSION PORTAL ----------------- */}
        <section className="max-w-7xl mx-auto px-6 py-16" id="auth-section">
          <div className="rounded-3xl bg-[#141724] border border-cyan-400/30 p-8 sm:p-14 relative overflow-hidden shadow-[0_0_50px_rgba(0,242,254,0.15)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Value Prop */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-mono text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Beta Tester Portal • Multi-Tenant Isolated</span>
                </div>

                <h2 className="font-headline font-bold text-3xl sm:text-5xl text-white leading-tight">
                  Ready To Map Your <br />
                  <span className="text-cyan-400">Next 5-Year Trajectory?</span>
                </h2>

                <p className="text-base text-gray-400 leading-relaxed font-light">
                  Select your assigned beta tester track or sign in below. Each tester gets a 100% isolated session with private career stories, CV Forge, and dynamic job radar.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant 1-Click Tester Login (Password: password1234)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Personalized skill accrual & permanent career vault</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI counselor with voice dictation & live job matching</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 1-Click Tester Card Grid & Login Form */}
              <div className="lg:col-span-6">
                <div className="bg-[#07090f] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
                  
                  {/* Tab Switcher */}
                  <div className="flex p-1 rounded-xl bg-[#141724] mb-6">
                    <button
                      onClick={() => setAuthTab('quick')}
                      className={`flex-1 py-2 rounded-lg font-headline font-bold text-xs transition-all cursor-pointer ${
                        authTab === 'quick' ? 'bg-cyan-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Quick 1-Click Beta Testers
                    </button>
                    <button
                      onClick={() => setAuthTab('manual')}
                      className={`flex-1 py-2 rounded-lg font-headline font-semibold text-xs transition-all cursor-pointer ${
                        authTab === 'manual' ? 'bg-cyan-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Manual Credentials Form
                    </button>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  {authTab === 'quick' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-1.5 mb-1">
                        <span>Click any tester track to enter directly:</span>
                        <span className="font-mono text-cyan-400 font-semibold">Shared Password: password1234</span>
                      </div>

                      {/* Filter Segmented Control: All / Available Open / Assigned */}
                      {(() => {
                        const rawTesters = testers && testers.length > 0 ? testers : DEFAULT_TESTERS;
                        const openCount = rawTesters.filter((t) => t.status === 'OPEN').length;
                        const assignedCount = rawTesters.filter((t) => t.status === 'ASSIGNED').length;
                        const filteredTesters = rawTesters.filter((t) => {
                          if (testerFilter === 'open') return t.status === 'OPEN';
                          if (testerFilter === 'assigned') return t.status === 'ASSIGNED';
                          return true;
                        });

                        return (
                          <>
                            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141724] border border-white/5 text-xs">
                              <button
                                type="button"
                                onClick={() => setTesterFilter('all')}
                                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                                  testerFilter === 'all'
                                    ? 'bg-cyan-400 text-black font-bold shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                All (20)
                              </button>
                              <button
                                type="button"
                                onClick={() => setTesterFilter('open')}
                                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  testerFilter === 'open'
                                    ? 'bg-emerald-400 text-black font-bold shadow-sm'
                                    : 'text-emerald-400 hover:text-emerald-300'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Open Slots ({openCount})</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTesterFilter('assigned')}
                                className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                                  testerFilter === 'assigned'
                                    ? 'bg-blue-400 text-black font-bold shadow-sm'
                                    : 'text-blue-400 hover:text-blue-300'
                                }`}
                              >
                                Assigned ({assignedCount})
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1.5 border border-white/5 rounded-xl bg-[#141724]/60">
                              {filteredTesters.map((t) => {
                                const isOpen = t.status === 'OPEN';
                                return (
                                  <button
                                    key={t.username}
                                    type="button"
                                    disabled={isAuthenticating}
                                    onClick={() => handleQuickLogin(t.username)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 ${
                                      isOpen
                                        ? 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-200'
                                        : 'border-blue-500/30 bg-blue-950/30 hover:bg-blue-950/50 text-blue-200'
                                    }`}
                                  >
                                    <div className="truncate pr-2">
                                      <span className="text-xs font-bold block truncate text-white">
                                        {t.name}
                                      </span>
                                      <span className="text-[10px] font-mono text-gray-400 block truncate">
                                        {t.username} • {t.role_track}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                                        isOpen
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      }`}
                                    >
                                      {isOpen ? 'AVAILABLE' : (t.badge || 'ASSIGNED')}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}

                      <p className="font-mono text-[11px] text-center text-gray-500 pt-2">
                        100% private data sandbox per tester in OCI cloud VM.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div>
                        <label className="block font-mono text-xs text-gray-400 mb-1.5">Username / Test ID</label>
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="e.g. user1"
                          className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono placeholder:text-gray-600 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs text-gray-400 mb-1.5">Password</label>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="password1234"
                          className="w-full px-4 py-3 rounded-xl bg-[#141724] border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-sm font-mono placeholder:text-gray-600 transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3.5 rounded-xl font-headline font-bold text-sm bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                      >
                        {isAuthenticating ? (
                          <span>Authenticating...</span>
                        ) : (
                          <>
                            <span>Sign In as {usernameInput || 'Tester'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <p className="font-mono text-[11px] text-center text-gray-500 pt-1">
                        Use accounts user1 to user10 with password1234.
                      </p>
                    </form>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ----------------- NODE INSPECTOR MODAL ----------------- */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#141724] border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[11px] text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
                  {selectedNode.level}
                </span>
                <h3 className="font-headline font-bold text-xl text-white">
                  {selectedNode.title}
                </h3>
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  {formatCompensation(selectedNode.compRange, currency)}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Skills */}
            <div>
              <span className="font-mono text-xs text-gray-400 block mb-2 font-semibold">
                Skills Demonstrated & Accrued at Node:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedNode.skills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-[#07090f] border border-white/10 font-mono text-xs text-cyan-300"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {selectedNode.details && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="p-3 rounded-xl bg-[#07090f] border border-white/5 text-xs text-gray-300 space-y-1">
                  <span className="font-headline font-semibold text-cyan-400 block">
                    Aura Counselor Rationale:
                  </span>
                  <p className="italic text-gray-400 leading-relaxed">
                    "{selectedNode.details.counselorAdvice}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-gray-500">
                EV Fit Score: <strong className="text-emerald-400">{selectedNode.evScore}</strong>
              </span>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  scrollToAuth();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-headline font-bold text-xs hover:bg-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Simulate Node in Aura</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- GLOBAL FOOTER ----------------- */}
      <footer className="w-full bg-[#07090f] border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-headline font-bold text-lg text-white">Aura AI Career Intelligence</span>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-gray-400">
            <a href="#simulator" className="hover:text-white transition-colors">Trajectory Tree</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#matrix" className="hover:text-white transition-colors">Competency Matrix</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <button onClick={scrollToAuth} className="hover:text-white transition-colors cursor-pointer">
              Tester Portal
            </button>
          </div>

          <div className="font-mono text-xs text-gray-500">
            © 2026 Aura AI Intelligence. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
