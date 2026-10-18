import React, { useState } from 'react';
import {
  GitFork,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  Shield,
  Compass,
  Cpu,
  Users,
  Briefcase,
  Upload,
  Edit3,
  UserCheck,
  Eye,
  EyeOff,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrency, formatCompensation } from '../../utils/currency';
import { TimelineExtractorModal } from '../Artifacts/TimelineExtractorModal';
import type { ArtifactsMap, AuthUser } from '../../types';

interface CareerNode {
  id: string;
  level: string;
  title: string;
  subtitle?: string;
  description: string;
  compRange: string;
  evScore: number;
  metricsDelta?: string;
  skills: string[];
  isChosen?: boolean;
  isAlternate?: boolean;
  isTarget?: boolean;
  details?: {
    overview: string;
    unlockedPathways: string[];
    skillsMastered: Array<{ name: string; score: number; color: string }>;
    counselorAdvice?: string;
  };
}

interface CareerTrack {
  id: string;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  rootNode: CareerNode;
  forkNodes: CareerNode[];
  inclineNode: CareerNode;
  canopyNodes: CareerNode[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'engineering_mgmt',
    name: 'Tech & Engineering Strategy',
    badge: 'Executive Tech Track',
    icon: Cpu,
    rootNode: {
      id: 'root_1',
      level: 'Level 01 • Engineering Origin',
      title: 'ROOT: B.Tech Engineering Foundation',
      description: 'Numerical optimization, algorithmic problem solving, kinematics, and core systems architecture.',
      compRange: '$65k – $78k',
      evScore: 50,
      skills: ['Python Systems', 'Algorithms', 'CAD / FEA', 'Calculus III'],
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
        title: 'Direct Industry Plant Engineering',
        description: 'Linear domain skill accrual with capped early compensation multiplier and limited leadership exposure.',
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
        title: 'Top-Tier MBA / Strategy Leadership',
        subtitle: 'RECOMMENDED OPTIMAL PATH',
        description: 'Premier business management focusing on Tech Management, Corporate Strategy & Operations. Bridges engineering rigor with capital governance.',
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
        description: 'Deep technical research track oriented toward lab research and individual contributor systems engineering.',
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
      description: 'Enterprise scale-up bridge role. Synthesizes core technical engineering acumen with business unit governance.',
      compRange: '$160k – $195k + Equity',
      evScore: 94,
      skills: ['Quantitative Modeling', 'Cross-Functional Strategy', 'Executive Communication', 'SLA Recovery'],
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
    icon: Briefcase,
    rootNode: {
      id: 'root_wfm',
      level: 'Level 01 • Operations Origin',
      title: 'ROOT: Contact Center Operations Specialist',
      description: 'Foundational front-line operations. Mastery of queue dynamics, SLA compliance, and multi-channel triage.',
      compRange: '₹4.5L – ₹6.5L',
      evScore: 52,
      skills: ['Queue Monitoring', 'SLA Adherence', 'Agent Telephony', 'Excel Metrics'],
      isChosen: true,
      details: {
        overview: 'Frontline operations experience establishes intuitive grasp of SLA latency and employee adherence challenges.',
        unlockedPathways: ['WFM Analyst', 'Shift Operations Lead', 'Workforce Scheduler'],
        skillsMastered: [
          { name: 'SLA Adherence Tracking', score: 92, color: 'text-cyan-400' },
          { name: 'Intraday Triage', score: 85, color: 'text-blue-400' }
        ],
        counselorAdvice: 'Translate daily queue management into quantitative variance reports to accelerate promotion.'
      }
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
        subtitle: 'RECOMMENDED QUANTITATIVE FORK',
        description: 'Transition into algorithmic intraday scheduling, Erlang-C staffing simulations, and Nice/IEX systems.',
        compRange: '₹10L – ₹14L',
        evScore: 97,
        metricsDelta: '+140% Comp Acceleration',
        skills: ['Erlang-C Modeling', 'IEX / Nice WFM', 'Real-Time Adherence (RTA)', 'Variance Root-Cause'],
        isChosen: true,
        details: {
          overview: 'The highest-leverage specialization in operational contact centers, commanding premium compensation across BPOs and enterprise tech.',
          unlockedPathways: ['Capacity Planning Specialist', 'WFM Operations Manager', 'Global Command Center Director'],
          skillsMastered: [
            { name: 'Erlang-C Math Models', score: 98, color: 'text-emerald-400' },
            { name: 'Workforce Management Suites', score: 94, color: 'text-cyan-400' }
          ],
          counselorAdvice: 'Master Erlang formulas in SQL/Python to differentiate yourself from legacy Excel-only schedulers.'
        }
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
      isChosen: true,
      details: {
        overview: 'Governs high-dollar enterprise SLA contracts and directs multi-regional shift logistics across international delivery centers.',
        unlockedPathways: ['Director of Capacity Planning', 'Global Head of WFM', 'VP Operations'],
        skillsMastered: [
          { name: 'Enterprise Capacity Forecasts', score: 96, color: 'text-cyan-400' },
          { name: 'Executive Client Reporting', score: 91, color: 'text-emerald-400' }
        ],
        counselorAdvice: 'Build executive QBR case studies showcasing cost-per-seat reductions and shrinkage stabilization.'
      }
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
    icon: Users,
    rootNode: {
      id: 'root_hr',
      level: 'Level 01 • Talent Origin',
      title: 'ROOT: Talent Acquisition Specialist',
      description: 'Full-cycle tech recruitment, applicant tracking systems (ATS), and candidate pipeline sourcing.',
      compRange: '₹5L – ₹7.5L',
      evScore: 50,
      skills: ['LinkedIn Recruiter', 'ATS Pipeline Triage', 'Screening', 'Offer Rolling'],
      isChosen: true,
      details: {
        overview: 'Foundational recruitment gives front-row understanding of organizational headcount needs and market talent velocity.',
        unlockedPathways: ['HRBP Lead', 'People Analytics Specialist', 'Talent Operations Head'],
        skillsMastered: [
          { name: 'Talent Sourcing Speed', score: 94, color: 'text-cyan-400' },
          { name: 'Stakeholder Screening', score: 87, color: 'text-blue-400' }
        ],
        counselorAdvice: 'Track conversion rates and offer acceptance ratios rigorously to prove commercial talent acquisition impact.'
      }
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
        subtitle: 'RECOMMENDED STRATEGIC FORK',
        description: 'Strategic advisor to VP of Engineering and Product. Leads org design, talent retention, and performance appraisals.',
        compRange: '₹14L – ₹20L',
        evScore: 96,
        metricsDelta: '+160% Comp Acceleration',
        skills: ['Org Design', 'Leadership Coaching', 'Succession Planning', 'Attrition Analytics'],
        isChosen: true,
        details: {
          overview: 'The pivotal leap from operational recruiting to strategic C-suite advisory, directly influencing retention and organizational scaling.',
          unlockedPathways: ['Head of People Ops', 'Chief People Officer', 'VP Talent Strategy'],
          skillsMastered: [
            { name: 'Org Restructuring', score: 95, color: 'text-emerald-400' },
            { name: 'Retention Strategy', score: 92, color: 'text-cyan-400' }
          ],
          counselorAdvice: 'Position yourself as an operational multiplier who diagnoses team morale and retention risks before they hit product timelines.'
        }
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
      isChosen: true,
      details: {
        overview: 'Owns enterprise talent governance across multi-regional engineering and operational offices.',
        unlockedPathways: ['Chief People Officer (CPO)', 'VP Human Resources', 'Board Advisory Partner'],
        skillsMastered: [
          { name: 'Total Rewards & ESOP Modeling', score: 97, color: 'text-emerald-400' },
          { name: 'Leadership Succession', score: 93, color: 'text-cyan-400' }
        ],
        counselorAdvice: 'Align compensation benchmarks with revenue per employee metrics to demonstrate clear ROI to the board.'
      }
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

const buildDynamicTrack = (
  artifacts: ArtifactsMap | null,
  user: AuthUser | null
): CareerTrack => {
  const stories = artifacts?.career_story?.stories || [];
  const workHistory = artifacts?.profile_master?.work_history || [];
  const candidate = artifacts?.profile_master?.candidate;
  const traits = artifacts?.traits;
  const skillsMatrix = artifacts?.skills_matrix?.categories || {};

  const recentRole =
    workHistory[0]?.role ||
    candidate?.headline ||
    user?.latest_role ||
    user?.role_track ||
    'Application Support Lead';

  const recentCompany =
    workHistory[0]?.company ||
    user?.company ||
    'Enterprise Operations Platform';

  const recentSummary =
    candidate?.experience_summary ||
    workHistory[0]?.summary ||
    `Specialist with demonstrated track record in ${recentRole} governing enterprise reliability, triage, and systems operations.`;

  // Collect demonstrated skills from stories and matrix
  const extractedSkills = Array.from(
    new Set([
      ...stories.flatMap((s: any) => s.demonstrated_skills || []),
      ...Object.values(skillsMatrix).flat().map((sk: any) => sk.name || sk),
      ...(workHistory[0]?.responsibilities || []).slice(0, 3)
    ])
  ).filter(Boolean);

  const roleLower = recentRole.toLowerCase();
  const isWfm = roleLower.includes('wfm') || roleLower.includes('workforce') || roleLower.includes('rta');
  const isHr = roleLower.includes('hr') || roleLower.includes('talent') || roleLower.includes('people');
  const isConsulting = roleLower.includes('consult') || roleLower.includes('strategy');
  const isData = roleLower.includes('data') || roleLower.includes('analytic');
  const isSupport = roleLower.includes('support') || roleLower.includes('incident') || roleLower.includes('operation') || roleLower.includes('systems');

  const fallbackSkills = isSupport
    ? ['Production Triage', 'T-SQL & Databases', 'SLA Recovery', 'Incident Command']
    : isWfm
    ? ['Capacity Planning', 'Erlang Modeling', 'Real-Time Adherence', 'BPO Governance']
    : isHr
    ? ['Talent Architecture', 'Total Rewards', 'People Analytics', 'HR SaaS']
    : isData
    ? ['SQL Pipelines', 'Data Modeling', 'Data Pipelines', 'Analytics Engineering']
    : ['Systems Architecture', 'Operational Strategy', 'Cross-Functional Execution', 'Process Automation'];

  const rootSkills = extractedSkills.length > 0 ? extractedSkills.slice(0, 4) : fallbackSkills;

  // Level 01: Root Node
  const rootNode: CareerNode = {
    id: 'dynamic_root',
    level: `Level 01 • Baseline Root (${recentCompany})`,
    title: `ROOT: ${recentRole}`,
    description: recentSummary,
    compRange: isSupport ? '₹16L – ₹26L' : isWfm ? '₹18L – ₹28L' : isHr ? '₹16L – ₹24L' : isConsulting ? '₹24L – ₹38L' : '₹22L – ₹34L',
    evScore: 55 + Math.min(stories.length * 6, 25),
    skills: rootSkills,
    isChosen: true,
    details: {
      overview: `Anchored to your verified Career Vault at ${recentCompany}. Reflects ${stories.length} verified incident/project stories in your vault.`,
      unlockedPathways: ['Specialist Systems Depth', 'Forward-Deployed Architecture', 'Enterprise Transformation Leadership'],
      skillsMastered: rootSkills.map((s, idx) => ({
        name: s,
        score: 85 + (idx * 4) % 12,
        color: idx === 0 ? 'text-cyan-400' : idx === 1 ? 'text-emerald-400' : 'text-blue-400'
      })),
      counselorAdvice: 'Your verified execution track record is the definitive anchor for commanding higher-status pivot roles.'
    }
  };

  // Level 02: Decision Crossroads (Forks)
  let forkNodes: CareerNode[] = [];
  if (isSupport) {
    forkNodes = [
      {
        id: 'fork_support_a',
        level: 'Fork 2A • Technical Depth',
        title: 'Senior / Staff Platform Systems Engineer',
        description: 'Deep dive into high-availability distributed architecture, automated observability, and infrastructure fault tolerance.',
        compRange: '₹28L – ₹42L',
        evScore: 78,
        skills: ['Distributed Systems', 'Observability (Prometheus/Datadog)', 'Database Internals'],
        isAlternate: true,
        details: {
          overview: 'Specialized systems engineering track. Maximizes infrastructure ownership and platform resilience.',
          unlockedPathways: ['Principal Systems Engineer', 'Director of Infrastructure'],
          skillsMastered: [
            { name: 'System Internals', score: 92, color: 'text-cyan-400' },
            { name: 'High Availability', score: 88, color: 'text-blue-400' }
          ],
          counselorAdvice: 'Add cloud-native infrastructure automation to prevent ceiling limits.'
        }
      },
      {
        id: 'fork_support_b',
        level: 'Fork 2B • Optimal Leap',
        title: 'Forward-Deployed Engineer (FDE) / Solutions Architect',
        subtitle: 'RECOMMENDED OPTIMAL FORK',
        description: 'Bridges deep operational triage with strategic client architecture and enterprise platform integration.',
        compRange: '₹36L – ₹58L',
        evScore: 94,
        skills: ['Client Architecture', 'API Integrations', 'Cross-Functional Governance', 'Autonomous AI Workflows'],
        isChosen: true,
        details: {
          overview: 'Highest leverage trajectory for production operations leaders. Palantir / enterprise high-growth model.',
          unlockedPathways: ['VP of Solutions Engineering', 'Chief Technology Officer (CTO)'],
          skillsMastered: [
            { name: 'Architecture Design', score: 96, color: 'text-cyan-400' },
            { name: 'Client Governance', score: 92, color: 'text-emerald-400' }
          ],
          counselorAdvice: 'Package real production incident post-mortems as client architectural proofs of work.'
        }
      },
      {
        id: 'fork_support_c',
        level: 'Fork 2C • Management',
        title: 'Technical Service Delivery & Operations Manager',
        description: 'Governance over enterprise SLA thresholds, major incident command, and operational vendor steering.',
        compRange: '₹30L – ₹46L',
        evScore: 82,
        skills: ['ITIL Governance', 'Incident Command', 'Vendor Steering'],
        isAlternate: true,
        details: {
          overview: 'Leadership track governing mission-critical SLAs and resolver teams across multiple client accounts.',
          unlockedPathways: ['Director of Operations', 'VP of Service Delivery'],
          skillsMastered: [
            { name: 'SLA Governance', score: 94, color: 'text-amber-400' },
            { name: 'Incident Command', score: 90, color: 'text-cyan-400' }
          ],
          counselorAdvice: 'Automate reporting feeds early to free time for strategic roadmap leadership.'
        }
      }
    ];
  } else if (isWfm) {
    forkNodes = CAREER_TRACKS.find(t => t.id === 'wfm_track')?.forkNodes || [];
  } else if (isHr) {
    forkNodes = CAREER_TRACKS.find(t => t.id === 'hr_track')?.forkNodes || [];
  } else {
    forkNodes = CAREER_TRACKS.find(t => t.id === 'engineering_mgmt')?.forkNodes || [];
  }

  // Level 03: Incline Milestone
  const inclineNode: CareerNode = {
    id: 'dynamic_incline',
    level: 'Level 03 • Incline Milestone (Promoted Mid-Point)',
    title: isSupport ? 'Director of Enterprise Systems & Reliability' : isWfm ? 'Director of Global Workforce Strategy' : isHr ? 'Head of People Operations & Technology' : 'Director of Strategic Transformation',
    description: `Enterprise scale-up bridge role synthesized from your ${recentRole} foundation and demonstrated competencies.`,
    compRange: '₹55L – ₹85L',
    evScore: 92,
    skills: ['Executive Communication', 'Scale Governance', 'Strategic Roadmap', 'Enterprise Reliability'],
    isChosen: true,
    details: {
      overview: 'Synthesizes deep technical/operational mastery with executive steering and capital governance.',
      unlockedPathways: ['Executive Canopy', 'Board Advisory'],
      skillsMastered: [
        { name: 'Executive Presence', score: 94, color: 'text-cyan-400' },
        { name: 'P&L Strategy', score: 88, color: 'text-emerald-400' }
      ],
      counselorAdvice: 'Adopt downward inflection and deliberate executive pauses when presenting metrics to board members.'
    }
  };

  // Level 04: Canopy Executive Destinations
  const targetProfiles = traits?.target_profiles || [];
  const canopyNodes: CareerNode[] = targetProfiles.length > 0
    ? targetProfiles.slice(0, 4).map((tp: any, idx: number) => ({
        id: `canopy_dyn_${idx}`,
        level: `Canopy Pivot 4${String.fromCharCode(65 + idx)}`,
        title: tp.title || 'Executive Leadership Principal',
        description: tp.rationale || 'High-leverage executive destination synthesized from your vault competencies.',
        compRange: '₹85L – ₹1.5Cr',
        evScore: 95 - idx * 2,
        skills: rootSkills.concat(['Executive Strategy', 'P&L Ownership']),
        isChosen: idx === 1,
        isTarget: idx === 1,
        isAlternate: idx !== 1
      }))
    : [
        {
          id: 'canopy_dyn_a',
          level: 'Canopy Pivot 4A',
          title: isSupport ? 'VP of Infrastructure & Platform Operations' : 'VP of Operations & Enterprise Strategy',
          description: 'Top canopy executive destination overseeing multi-million operational portfolios.',
          compRange: '₹85L – ₹1.3Cr',
          evScore: 94,
          skills: ['Enterprise Strategy', 'Operational Scale', 'P&L Management'],
          isAlternate: true
        },
        {
          id: 'canopy_dyn_b',
          level: 'Canopy Pivot 4B • Optimal Leap',
          title: isSupport ? 'VP of Solutions Engineering & Global Operations' : 'Chief Operating Officer (COO)',
          subtitle: 'TARGET DESTINATION',
          description: 'High-status executive leadership governing global platforms, AI workflows, and strategic organizational execution.',
          compRange: '₹1.1Cr – ₹1.8Cr',
          evScore: 98,
          skills: ['Executive Governance', 'Strategic Transformation', 'Autonomous Systems'],
          isChosen: true,
          isTarget: true
        },
        {
          id: 'canopy_dyn_c',
          level: 'Canopy Pivot 4C',
          title: 'Chief Technology Officer (CTO) / Platform Lead',
          description: 'Strategic technology steering governing enterprise availability, software innovation, and architectural roadmap.',
          compRange: '₹1.2Cr – ₹2.0Cr',
          evScore: 93,
          skills: ['Technology Strategy', 'Architecture Vision', 'Executive Leadership'],
          isAlternate: true
        },
        {
          id: 'canopy_dyn_d',
          level: 'Canopy Pivot 4D',
          title: 'DeepTech Founder / Autonomous Systems Principal',
          description: 'Founder or early principal equity holder building high-leverage agentic or operational platforms.',
          compRange: 'Asymmetric Equity + ₹1.5Cr',
          evScore: 91,
          skills: ['Zero-to-One Product', 'Autonomous AI', 'Fundraising Strategy'],
          isAlternate: true
        }
      ];

  return {
    id: 'vault_dynamic_track',
    name: `${recentRole} Trajectory`,
    badge: `${stories.length} Story Powered`,
    icon: Compass,
    rootNode,
    forkNodes,
    inclineNode,
    canopyNodes
  };
};

export const CareerTreeView: React.FC = () => {
  const { currentUser, artifacts, setActiveModule, setChatCollapsed, updateTesterRole } = useAppStore();
  const [currency] = useCurrency();
  const [showSamplePreview, setShowSamplePreview] = useState(false);

  const stories = artifacts?.career_story?.stories || [];
  const workHistory = artifacts?.profile_master?.work_history || [];
  const candidate = artifacts?.profile_master?.candidate;

  const hasData = stories.length > 0 || workHistory.length > 0 || Boolean(candidate?.headline);

  // Quick Role Calibration Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleSaveSuccess, setRoleSaveSuccess] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const openRoleModal = () => {
    setRoleInput(candidate?.headline || currentUser?.latest_role || '');
    setCompanyInput(workHistory?.[0]?.company || currentUser?.company || '');
    setNameInput(candidate?.name || currentUser?.name || '');
    setRoleSaveSuccess(false);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    setIsSavingRole(true);
    const ok = await updateTesterRole(roleInput.trim(), companyInput.trim(), nameInput.trim());
    setIsSavingRole(false);
    if (ok) {
      setRoleSaveSuccess(true);
      setTimeout(() => {
        setIsRoleModalOpen(false);
        setRoleSaveSuccess(false);
      }, 1000);
    }
  };

  // Build dynamic track if user has data
  const dynamicTrack = hasData ? buildDynamicTrack(artifacts, currentUser) : null;
  const availableTracks = dynamicTrack ? [dynamicTrack, ...CAREER_TRACKS] : CAREER_TRACKS;

  const [activeTrackId, setActiveTrackId] = useState<string>(
    hasData ? 'vault_dynamic_track' : 'engineering_mgmt'
  );
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);

  const activeTrack = availableTracks.find((t) => t.id === activeTrackId) || availableTracks[0];

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] text-gray-100 overflow-y-auto">
      {/* Integrated Workspace Header Bar */}
      <div className="border-b border-gray-800 bg-[#0f121d]/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">Predictive Career Trajectory Tree</h1>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                hasData
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                  : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
              }`}
            >
              {hasData ? `${stories.length} Stories · Dynamic Vault Tree` : 'Genesis State (Empty Canvas)'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Simulate career forks, quantify skill compounding, and inspect high-leverage canopy destinations.
          </p>
        </div>

        {/* Track Switcher */}
        {hasData ? (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800 overflow-x-auto no-scrollbar max-w-full shrink">
            {availableTracks.map((t) => {
              const Icon = t.icon;
              const isSelected = t.id === activeTrack.id;
              const isVaultTrack = t.id === 'vault_dynamic_track';
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTrackId(t.id);
                    setSelectedNode(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? isVaultTrack
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? (isVaultTrack ? 'text-emerald-400' : 'text-cyan-400') : 'text-gray-500'}`} />
                  <span>{t.name}</span>
                  {isVaultTrack && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold">
                      Personal Vault
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono">
            {showSamplePreview ? (
              <button
                onClick={() => setShowSamplePreview(false)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Return to Blank Personal Canvas</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Awaiting Story / Profile in Vault</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-3 sm:p-6 max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
        {!hasData && !showSamplePreview ? (
          /* BLANK / GENESIS STATE WHEN NO STORIES OR TIMELINE EXIST */
          <div className="relative rounded-3xl bg-[#0c0f18] border border-gray-800 p-8 sm:p-12 overflow-hidden shadow-2xl text-center">
            {/* Subtle Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950 via-blue-950 to-indigo-950 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-950">
                <GitFork className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 font-bold">
                  Genesis State • Awaiting Stories in Vault
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your Career Trajectory Tree Has Not Sprouted Yet
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
                  The Career Tree is built dynamically from your verified career stories, recent organization role, and demonstrated skill set in your Career Vault. Currently, your account (<span className="text-cyan-300 font-bold">{currentUser?.name || currentUser?.username}</span> · <span className="text-gray-300">{currentUser?.role_track}</span>) has 0 stories and 0 timeline roles recorded.
                </p>
              </div>

              {/* Architectural Blueprint Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#141724]/80 border border-white/5 text-left text-xs">
                <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono text-[10px]">1</span>
                    <span>Anchor Recent Role</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sets your Level 01 Baseline Root node and recent organization.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center font-mono text-[10px]">2</span>
                    <span>Mine 1 STARR Story</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Aura extracts verified metrics, incident recovery, and technical competencies.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-mono text-[10px]">3</span>
                    <span>Pivots & Canopy Sprout</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Forks (L2) and executive targets (L4) emerge dynamically from compounding skills.
                  </p>
                </div>
              </div>

              {/* Direct 1-Click Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setChatCollapsed(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-950 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Story Mining with Aura</span>
                </button>

                <button
                  onClick={openRoleModal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-indigo-300" />
                  <span>Calibrate Recent Role</span>
                </button>

                <button
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload CV / Timeline</span>
                </button>
              </div>

              {/* Optional Sample Preview Toggle */}
              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowSamplePreview(true)}
                  className="text-xs text-gray-500 hover:text-gray-300 font-mono transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview Interactive Sample Architecture</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {showSamplePreview && !hasData && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Viewing <strong>Interactive Sample Tree Architecture</strong>. Your personal tree is currently blank because no stories or roles are recorded in your vault yet.
                  </span>
                </div>
                <button
                  onClick={() => setShowSamplePreview(false)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shrink-0 transition-colors cursor-pointer"
                >
                  Return to Blank Personal Canvas
                </button>
              </div>
            )}

            {/* Track Summary Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-purple-950/40 border border-cyan-500/30 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{activeTrack.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activeTrack.badge}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Click any node below to inspect verified skills, expected compensation bands, and AI counselor advice.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              <span>Optimal Leap</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
              <span>Alternate Paths</span>
            </div>
          </div>
        </div>

        {/* 4-TIER CAREER TREE CANVAS */}
        <div className="relative rounded-3xl bg-[#0c0f18] border border-gray-800 p-8 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full"></div>

          <div className="flex flex-col-reverse gap-10 relative z-10">
            {/* 1. ROOT LEVEL (Foundation) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-3">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeTrack.rootNode.level}</span>
              </div>

              <div
                onClick={() => setSelectedNode(activeTrack.rootNode)}
                className="w-full max-w-xl p-5 rounded-2xl bg-[#141724] border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group shadow-lg hover:shadow-cyan-500/10 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {activeTrack.rootNode.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {activeTrack.rootNode.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-cyan-400 block">
                      {formatCompensation(activeTrack.rootNode.compRange, currency)}
                    </span>
                    <span className="text-[10px] text-gray-500">CV Baseline</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                  {activeTrack.rootNode.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connecting Vertical Trunk Stem */}
              <div className="w-0.5 h-10 bg-gradient-to-t from-cyan-400 to-transparent mt-2"></div>
            </div>

            {/* 2. FORK LEVEL (Decision Crossroads) */}
            <div className="flex flex-col items-center">
              <div className="font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-4">
                Level 02 • Decision Crossroads (Upward Radial)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {activeTrack.forkNodes.map((fork) => {
                  const isChosen = fork.isChosen;
                  return (
                    <div
                      key={fork.id}
                      onClick={() => setSelectedNode(fork)}
                      className={`p-4 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                        isChosen
                          ? 'bg-[#151a2d] border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.2)]'
                          : 'bg-[#12141f]/70 border border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-700'
                      }`}
                    >
                      {isChosen && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-cyan-400 text-black font-mono text-[9px] font-bold tracking-wider">
                          OPTIMAL FORK
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                          <span>{fork.level}</span>
                          <span className={isChosen ? 'text-emerald-400 font-bold' : ''}>
                            CV Score: {fork.evScore}
                          </span>
                        </div>
                        <h5 className={`font-bold text-xs mb-1.5 ${isChosen ? 'text-white' : 'text-gray-300'}`}>
                          {fork.title}
                        </h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                          {fork.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-gray-400">Comp Band:</span>
                          <span className={isChosen ? 'text-cyan-300 font-bold' : 'text-gray-400'}>
                            {formatCompensation(fork.compRange, currency)}
                          </span>
                        </div>
                        {fork.metricsDelta && (
                          <div className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded text-center border border-emerald-500/20">
                            {fork.metricsDelta}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecting Trunk to Incline */}
              <div className="w-0.5 h-10 bg-cyan-400 mt-2 shadow-[0_0_10px_#22d3ee]"></div>
            </div>

            {/* 3. INCLINE LEVEL (Promoted Milestone) */}
            <div className="flex flex-col items-center">
              <div className="font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-3">
                Level 03 • Incline Milestone (Promoted Mid-Point)
              </div>

              <div
                onClick={() => setSelectedNode(activeTrack.inclineNode)}
                className="w-full max-w-xl p-5 rounded-2xl bg-gradient-to-r from-[#182038] to-[#121626] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.18)] hover:scale-[1.01] transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold mb-1.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>{activeTrack.inclineNode.level}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{activeTrack.inclineNode.title}</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {activeTrack.inclineNode.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-400 block">
                      {formatCompensation(activeTrack.inclineNode.compRange, currency)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Fit: {activeTrack.inclineNode.evScore}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                  {activeTrack.inclineNode.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-cyan-400/10 text-cyan-300 font-mono border border-cyan-400/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connecting Incline Stem */}
              <div className="w-0.5 h-10 bg-gradient-to-b from-cyan-400 via-purple-400 to-transparent mt-2"></div>
            </div>

            {/* 4. CANOPY LEVEL (Top Executive Destinations) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-4">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Level 04 • Top Canopy Executive Destinations (Future Pivot Roles)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {activeTrack.canopyNodes.map((canopy) => {
                  const isTarget = canopy.isTarget;
                  return (
                    <div
                      key={canopy.id}
                      onClick={() => setSelectedNode(canopy)}
                      className={`p-4 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                        isTarget
                          ? 'bg-gradient-to-b from-[#1c1833] to-[#121122] border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:scale-[1.02]'
                          : 'bg-[#12141f]/70 border border-gray-800 opacity-65 hover:opacity-100 hover:border-gray-700'
                      }`}
                    >
                      {isTarget && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-500 text-white font-mono text-[9px] font-bold tracking-wider">
                          TARGET DESTINATION
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                          <span>{canopy.level}</span>
                          <span className={isTarget ? 'text-purple-300 font-bold' : ''}>
                            {canopy.evScore}% Match
                          </span>
                        </div>
                        <h5 className={`font-bold text-xs mb-1.5 ${isTarget ? 'text-white' : 'text-gray-300'}`}>
                          {canopy.title}
                        </h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                          {canopy.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-gray-400">Comp Band:</span>
                          <span className={isTarget ? 'text-purple-300 font-bold' : 'text-gray-400'}>
                            {formatCompensation(canopy.compRange, currency)}
                          </span>
                        </div>
                        {canopy.metricsDelta && (
                          <div className="text-[10px] font-mono text-purple-300 font-semibold bg-purple-950/40 px-2 py-0.5 rounded text-center border border-purple-500/20">
                            {canopy.metricsDelta}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    )}

        {/* NODE INSPECTOR DRAWER / MODAL */}
        {selectedNode && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#141724] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase block mb-1">
                    {selectedNode.level}
                  </span>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">
                    {selectedNode.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Comp and Score Card */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <span className="text-[11px] text-gray-400 block font-mono">Estimated Comp Band</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">
                    {formatCompensation(selectedNode.compRange, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-mono">CV Expected Value Score</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {selectedNode.evScore} / 100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Role Blueprint</h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Strategic Overview */}
              {selectedNode.details?.overview && (
                <div>
                  <h5 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Strategic Overview</h5>
                  <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
                    {selectedNode.details.overview}
                  </p>
                </div>
              )}

              {/* Counselor Advice */}
              {selectedNode.details?.counselorAdvice && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Aura Counselor Strategic Directive</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{selectedNode.details.counselorAdvice}"
                  </p>
                </div>
              )}

              {/* Skills Mastered */}
              <div>
                <h5 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Required Core Competencies</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 font-mono text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>

                <button
                  onClick={() => {
                    setSelectedNode(null);
                    setActiveModule('trainer');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer"
                >
                  <span>Practice Interview for this Role</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Career Timeline Extraction Modal */}
      <TimelineExtractorModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
      />

      {/* Role Calibration & Assignment Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Anchor Recent Role & Sprout Tree</h3>
                <p className="text-[11px] text-gray-400">
                  Account: <span className="font-mono text-indigo-400 font-bold">{currentUser?.username}</span>
                </p>
              </div>
            </div>

            {roleSaveSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold">Role Saved & Tree Sprouted!</p>
                <p className="text-[11px] text-emerald-400/80">Your Career Trajectory Root is now anchored in the Career Vault.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Job Title / Professional Role <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Application Support Lead, Platform Engineer, WFM Lead"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TCS, Concentrix, Evolent Health, Deloitte"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Candidate Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRole || !roleInput.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingRole ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Save & Sprout Tree</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerTreeView;
