import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Video,
  Play,
  Square,
  FolderOpen,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Database,
  Eye,
  Camera,
  Sparkles,
  Copy,
  Check,
  Volume2,
  Award,
  BookOpen,
  ShieldCheck,
  RotateCcw,
  LayoutTemplate,
  Columns,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useVirtualBackground } from '../../hooks/useVirtualBackground';

export type TrackKey = 'tech_ba' | 'app_support' | 'data_analytics' | 'ai_systems';

export interface ScriptPillar {
  id: number;
  pillarNum: number;
  pillarTitle: string;
  subtitle: string;
  timeRange: string;
  secondsTarget: number;
  deliveryTip: string;
  vocalTechnique: string;
  scriptsByTrack: Record<
    TrackKey,
    {
      clean: string;
      withPacing: string;
    }
  >;
}

export const TRACK_INFO: Record<TrackKey, { label: string; badge: string; description: string }> = {
  tech_ba: {
    label: 'Forward-Deployed Engineer (FDE)',
    badge: 'Enterprise Solutions & Deployment',
    description: 'Bridge business requirements, complex healthcare data, and production system execution.'
  },
  app_support: {
    label: 'Application Support & Operations Lead',
    badge: 'L2/L3 Incident Governance',
    description: 'High-availability uptime, root-cause triage, SQL error automation, and SLA recovery.'
  },
  data_analytics: {
    label: 'Senior Data & Analytics Lead',
    badge: 'T-SQL & Analytics Engineering',
    description: '130+ stored procedures, reporting automation, and deep query performance optimization.'
  },
  ai_systems: {
    label: 'Autonomous AI & Systems Engineer',
    badge: 'Dual Moat: Enterprise + AI',
    description: '8.5 yrs enterprise production stability paired with real-time streaming & Agentic AI platforms.'
  }
};

export const CEO_PILLARS: ScriptPillar[] = [
  {
    id: 1,
    pillarNum: 1,
    pillarTitle: 'Part 1: What You Do',
    subtitle: 'Executive Identity & Domain Authority (0:00 - 0:20)',
    timeRange: '0:00 - 0:20',
    secondsTarget: 20,
    deliveryTip:
      'Look directly into the camera lens with open posture and calm confidence. Establish your executive scope immediately—never list university or chronological degrees.',
    vocalTechnique:
      'Downward Inflection ↓: End your opening statement on a grounded down-tone. This conveys unquestionable authority; uptalk sounds like asking for approval.',
    scriptsByTrack: {
      tech_ba: {
        clean:
          'Hi, my name is [Your Name].\n\nI am a Senior Technical Business Analyst with 9+ years of enterprise experience bridging business stakeholders, data architecture, and production systems in US healthcare.',
        withPacing:
          'Hi, my name is [Your Name]. [PAUSE 1s]\n\nI am a Senior Technical Business Analyst with 9+ years of enterprise experience [PAUSE 1s] bridging business stakeholders, data architecture, and production systems in US healthcare. ↓'
      },
      app_support: {
        clean:
          'Hi, my name is [Your Name].\n\nI am an Application Support and Operations Lead with 9+ years of enterprise experience governing high-availability production environments and L2/L3 incident resolution in US healthcare.',
        withPacing:
          'Hi, my name is [Your Name]. [PAUSE 1s]\n\nI am an Application Support and Operations Lead with 9+ years of enterprise experience [PAUSE 1s] governing high-availability production environments and L2/L3 incident resolution in US healthcare. ↓'
      },
      data_analytics: {
        clean:
          'Hi, my name is [Your Name].\n\nI am a Senior Data and Analytics Lead with 9+ years of enterprise experience designing high-performance SQL architectures, automated data pipelines, and executive intelligence in US healthcare.',
        withPacing:
          'Hi, my name is [Your Name]. [PAUSE 1s]\n\nI am a Senior Data and Analytics Lead with 9+ years of enterprise experience [PAUSE 1s] designing high-performance SQL architectures, automated data pipelines, and executive intelligence in US healthcare. ↓'
      },
      ai_systems: {
        clean:
          'Hi, my name is [Your Name].\n\nI am a Systems and Agentic AI Engineer with 9+ years of foundational enterprise production expertise, specializing in autonomous agent workflows, streaming data pipelines, and real-time execution architectures.',
        withPacing:
          'Hi, my name is [Your Name]. [PAUSE 1s]\n\nI am a Systems and Agentic AI Engineer with 9+ years of foundational enterprise production expertise, [PAUSE 1s] specializing in autonomous agent workflows, streaming data pipelines, and real-time execution architectures. ↓'
      }
    }
  },
  {
    id: 2,
    pillarNum: 2,
    pillarTitle: 'Part 2: Who You Help',
    subtitle: 'Target Stakeholders & Pain Points Eliminated (0:20 - 0:40)',
    timeRange: '0:20 - 0:40',
    secondsTarget: 20,
    deliveryTip:
      'Frame the exact business friction and operational pain points you eliminate for leaders. Demonstrate empathy and high-level business alignment.',
    vocalTechnique:
      'The Strategic Silence [PAUSE 1.5s]: Take a deliberate 1-second pause before detailing the problems. Junior candidates rush; executive leaders command the pause.',
    scriptsByTrack: {
      tech_ba: {
        clean:
          'I partner with healthcare operations executives, clinical product managers, and engineering squads who struggle with disconnected workflows, ambiguous ticket requirements, and slow operational turnaround times.',
        withPacing:
          'I partner with healthcare operations executives, clinical product managers, and engineering squads [PAUSE 1.5s] who struggle with disconnected workflows, ambiguous ticket requirements, and slow operational turnaround times. ↓'
      },
      app_support: {
        clean:
          'I help IT leadership, hospital clients, and business operations eliminate recurring system downtime, chaotic ticket backlogs, and compliance risks across mission-critical healthcare workflows.',
        withPacing:
          'I help IT leadership, hospital clients, and business operations [PAUSE 1.5s] eliminate recurring system downtime, chaotic ticket backlogs, and compliance risks across mission-critical healthcare workflows. ↓'
      },
      data_analytics: {
        clean:
          'I empower healthcare C-suite executives, clinical analysts, and operations directors who struggle with fragmented data silos, slow manual report generation, and inaccurate business metrics.',
        withPacing:
          'I empower healthcare C-suite executives, clinical analysts, and operations directors [PAUSE 1.5s] who struggle with fragmented data silos, slow manual report generation, and inaccurate business metrics. ↓'
      },
      ai_systems: {
        clean:
          'I partner with engineering teams and technical leaders who want to move beyond prototype AI and implement deterministic, production-grade autonomous agent systems and low-latency data pipelines.',
        withPacing:
          'I partner with engineering teams and technical leaders [PAUSE 1.5s] who want to move beyond prototype AI and implement deterministic, production-grade autonomous agent systems and low-latency data pipelines. ↓'
      }
    }
  },
  {
    id: 3,
    pillarNum: 3,
    pillarTitle: 'Part 3: How You Help & Results',
    subtitle: 'Concrete Mechanisms & Quantified ROI (0:40 - 1:10)',
    timeRange: '0:40 - 1:10',
    secondsTarget: 30,
    deliveryTip:
      'Slow down on your numbers. Let 130+ stored procedures, 80% automated reporting, and 60% SLA boost register with weight. Quantified facts build trust.',
    vocalTechnique:
      'Measured Cadence (130 WPM): Emphasize the nouns and numbers. Never mutter or rush when presenting your hard engineering achievements.',
    scriptsByTrack: {
      tech_ba: {
        clean:
          'I solve this by translating complex business requirements into production-ready data pipelines and structured Jira workflows.\n\nAt Evolent Health, I authored over 130 T-SQL stored procedures, automated 80% of recurring reporting feeds, and re-engineered cross-team triage by collapsing 200 sprawling resolver groups down to 60—driving a 60% boost in on-time SLA resolution.',
        withPacing:
          'I solve this by translating complex business requirements into production-ready data pipelines and structured Jira workflows. [PAUSE 1s]\n\nAt Evolent Health, I authored over [EMPHASIZE: 130 T-SQL stored procedures], automated [EMPHASIZE: 80% of recurring reporting feeds], and re-engineered cross-team triage by collapsing 200 sprawling resolver groups down to 60—driving an immediate [EMPHASIZE: 60% boost in on-time SLA resolution]. ↓'
      },
      app_support: {
        clean:
          'I accomplish this through disciplined root-cause analysis, proactive monitoring, and SQL-driven automation.\n\nI personally governed 100 to 150 production incidents monthly, engineered 130+ stored procedures to automate claim error remediation, and redesigned Jira dispatching—slashing ticket misroutes and lifting SLA compliance by 60%.',
        withPacing:
          'I accomplish this through disciplined root-cause analysis, proactive monitoring, and SQL-driven automation. [PAUSE 1s]\n\nI personally governed [EMPHASIZE: 100 to 150 production incidents monthly], engineered [EMPHASIZE: 130+ stored procedures] to automate claim error remediation, and redesigned Jira dispatching—slashing ticket misroutes and lifting [EMPHASIZE: SLA compliance by 60%]. ↓'
      },
      data_analytics: {
        clean:
          'I deliver this by building production-grade data pipelines and automated reporting suites.\n\nAt Evolent Health, I authored 130+ complex T-SQL stored procedures, automated 80% of ad-hoc and executive reports, and eradicated data reconciliation backlogs across multi-table claims datasets.',
        withPacing:
          'I deliver this by building production-grade data pipelines and automated reporting suites. [PAUSE 1s]\n\nAt Evolent Health, I authored [EMPHASIZE: 130+ complex T-SQL stored procedures], automated [EMPHASIZE: 80% of ad-hoc and executive reports], and eradicated data reconciliation backlogs across multi-table claims datasets. ↓'
      },
      ai_systems: {
        clean:
          'I build complete full-stack agentic platforms—including multi-agent interview coaches, streaming quant backtesters with sub-second WebSocket pipelines, and automated artifact vaults using modern LLM tool-calling and Python architectures.',
        withPacing:
          'I build complete full-stack agentic platforms—[PAUSE 1s] including multi-agent interview coaches, streaming quant backtesters with sub-second WebSocket pipelines, and automated artifact vaults using modern LLM tool-calling and Python architectures. ↓'
      }
    }
  },
  {
    id: 4,
    pillarNum: 4,
    pillarTitle: 'Part 4: Why You Are Different',
    subtitle: 'Your Inimitable Moat & Forward Hook (1:10 - 1:30)',
    timeRange: '1:10 - 1:30',
    secondsTarget: 20,
    deliveryTip:
      'Project high conviction and vision. Highlight your dual superpower: 8.5 years of enterprise L2/L3 stability combined with hands-on systems builder agency.',
    vocalTechnique:
      'The Executive Closer ↓: Finish with a definitive downward tone and a warm, steady gaze into the lens. No trailing off into "so yeah... that is my background".',
    scriptsByTrack: {
      tech_ba: {
        clean:
          'What sets me apart from a conventional BA is my rare dual edge: 8.5 years of battle-tested enterprise production stability, combined with hands-on systems builder capabilities—engineering streaming pipelines and Agentic AI tools from scratch.\n\nI do not just gather requirements; I guarantee end-to-end technical execution.',
        withPacing:
          'What sets me apart from a conventional BA is my rare dual edge: [PAUSE 1.5s] 8.5 years of battle-tested enterprise production stability, combined with hands-on systems builder capabilities—engineering streaming pipelines and Agentic AI tools from scratch. [PAUSE 1s]\n\nI do not just gather requirements; [EMPHASIZE: I guarantee end-to-end technical execution]. ↓'
      },
      app_support: {
        clean:
          'What sets me apart is that I do not just keep the lights on; I eliminate future incidents through code.\n\nPairing 8.5 years of enterprise triage mastery with modern Python streaming automation and Agentic AI workflows, I transform reactive support desks into high-velocity engineering partners.',
        withPacing:
          'What sets me apart is that I do not just keep the lights on; [PAUSE 1s] I eliminate future incidents through code. [PAUSE 1.5s]\n\nPairing 8.5 years of enterprise triage mastery with modern Python streaming automation and Agentic AI workflows, [EMPHASIZE: I transform reactive support desks into high-velocity engineering partners]. ↓'
      },
      data_analytics: {
        clean:
          'What makes me unique is my deep production fluency. While most analysts work only with downstream dashboards, I understand database locking, query execution plans, real-time message streams, and generative AI interfaces—ensuring that every analytical insight is backed by rock-solid engineering.',
        withPacing:
          'What makes me unique is my deep production fluency. [PAUSE 1s]\n\nWhile most analysts work only with downstream dashboards, I understand database locking, query execution plans, real-time message streams, and generative AI interfaces—[EMPHASIZE: ensuring that every analytical insight is backed by rock-solid engineering]. ↓'
      },
      ai_systems: {
        clean:
          'My unfair advantage is my deep enterprise pedigree: 8.5 years of strict L2/L3 production governance and SQL stability at Evolent Health.\n\nI bring high-assurance production rigor, zero-downtime discipline, and enterprise security into bleeding-edge AI engineering.',
        withPacing:
          'My unfair advantage is my deep enterprise pedigree: [PAUSE 1s] 8.5 years of strict L2/L3 production governance and SQL stability at Evolent Health. [PAUSE 1.5s]\n\nI bring high-assurance production rigor, zero-downtime discipline, and enterprise security into bleeding-edge AI engineering. ↓'
      }
    }
  }
];

export interface PacedSegment {
  id: string;
  type: 'phrase' | 'dash_pause' | 'downtone';
  text: string;
  cleanText: string;
  pauseDuration?: number;
  wordCount: number;
  startSec: number;
  endSec: number;
}

export function parsePacedScript(rawScript: string, targetSeconds: number): PacedSegment[] {
  // Regex to match [PAUSE Xs] or ↓ (using non-capturing group for inner digits)
  const tokenRegex = /(\[PAUSE\s+(?:[\d.]+)s?\]|↓)/gi;
  const parts = rawScript.split(tokenRegex);

  const rawChunks: { type: 'phrase' | 'dash_pause' | 'downtone'; content: string; pauseSec?: number }[] = [];

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    if (!chunk) continue;

    const pauseMatch = chunk.match(/^\[PAUSE\s+([\d.]+)s?\]$/i);
    if (pauseMatch) {
      rawChunks.push({
        type: 'dash_pause',
        content: chunk,
        pauseSec: parseFloat(pauseMatch[1]) || 1.0
      });
      continue;
    }

    if (chunk === '↓') {
      rawChunks.push({
        type: 'downtone',
        content: '↓'
      });
      continue;
    }

    const trimmed = chunk.trim();
    if (trimmed) {
      rawChunks.push({
        type: 'phrase',
        content: trimmed
      });
    }
  }

  // Calculate total pause time and total words
  let totalPauseSec = 0;
  let totalWords = 0;
  let hasDowntone = false;

  rawChunks.forEach((c) => {
    if (c.type === 'dash_pause') {
      totalPauseSec += c.pauseSec || 1.0;
    } else if (c.type === 'downtone') {
      hasDowntone = true;
    } else if (c.type === 'phrase') {
      const words = c.content.replace(/\[EMPHASIZE:\s*|\]/g, '').split(/\s+/).filter(Boolean).length;
      totalWords += Math.max(1, words);
    }
  });

  const downtoneBufferSec = hasDowntone ? 1.0 : 0;
  const speakingTimeSec = Math.max(2, targetSeconds - totalPauseSec - downtoneBufferSec);
  const secPerWord = speakingTimeSec / Math.max(1, totalWords);

  // Assign timestamps
  const segments: PacedSegment[] = [];
  let currentStart = 0;

  rawChunks.forEach((c, idx) => {
    if (c.type === 'dash_pause') {
      const dur = c.pauseSec || 1.0;
      segments.push({
        id: `pause-${idx}`,
        type: 'dash_pause',
        text: c.content,
        cleanText: '',
        pauseDuration: dur,
        wordCount: 0,
        startSec: Math.round(currentStart * 10) / 10,
        endSec: Math.round((currentStart + dur) * 10) / 10
      });
      currentStart += dur;
    } else if (c.type === 'downtone') {
      segments.push({
        id: `downtone-${idx}`,
        type: 'downtone',
        text: '↓',
        cleanText: '',
        wordCount: 0,
        startSec: Math.max(0, targetSeconds - 1.0),
        endSec: targetSeconds
      });
    } else {
      const words = c.content.replace(/\[EMPHASIZE:\s*|\]/g, '').split(/\s+/).filter(Boolean).length;
      const dur = Math.max(1, words * secPerWord);
      segments.push({
        id: `phrase-${idx}`,
        type: 'phrase',
        text: c.content,
        cleanText: c.content.replace(/\[EMPHASIZE:\s*|\]/g, ''),
        wordCount: words,
        startSec: Math.round(currentStart * 10) / 10,
        endSec: Math.round((currentStart + dur) * 10) / 10
      });
      currentStart += dur;
    }
  });

  return segments;
}

export const InterviewTrainerView: React.FC = () => {
  const [activeTrainerMode, setActiveTrainerMode] = useState<'intro' | 'communication' | 'technical'>('intro');
  const [selectedTrack, setSelectedTrack] = useState<TrackKey>('tech_ba');
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isFullRun, setIsFullRun] = useState<boolean>(false);
  const [showPacingCues, setShowPacingCues] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [layoutMode, setLayoutMode] = useState<'top' | 'split'>('top');
  const [copied, setCopied] = useState<boolean>(false);

  // Video recording & virtual background states
  const {
    videoRef,
    canvasRef,
    isCameraActive,
    isLoadingModel,
    backgroundMode,
    setBackgroundMode,
    startCamera,
    stopCamera,
    getRecordingStream
  } = useVirtualBackground();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);

  // Rehearsal Pacing timer
  const [isPlayingPacing, setIsPlayingPacing] = useState<boolean>(false);
  const [pacingTimer, setPacingTimer] = useState<number>(0);
  const pacingIntervalRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const currentPillar = CEO_PILLARS[activePhaseIndex];

  // Active elapsed seconds in the current session
  const activeElapsedSeconds = isRecording ? recordingTimer : pacingTimer;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (pacingIntervalRef.current) clearInterval(pacingIntervalRef.current);
    };
  }, []);

  // Auto-advance across the 4 CEO parts during a Full 90-Second Run
  useEffect(() => {
    if (!isFullRun) return;
    const isRunning = isRecording || isPlayingPacing;
    if (!isRunning) return;

    const currentSeconds = isRecording ? recordingTimer : pacingTimer;
    let targetPhase = 0;
    if (currentSeconds < 20) {
      targetPhase = 0;
    } else if (currentSeconds < 40) {
      targetPhase = 1;
    } else if (currentSeconds < 70) {
      targetPhase = 2;
    } else {
      targetPhase = 3;
    }

    if (activePhaseIndex !== targetPhase) {
      setActivePhaseIndex(targetPhase);
    }
  }, [isFullRun, isRecording, isPlayingPacing, recordingTimer, pacingTimer, activePhaseIndex]);

  // Elapsed seconds inside the CURRENT part (0 to currentPillar.secondsTarget)
  const currentPartElapsed = useMemo(() => {
    if (!isFullRun) {
      return Math.min(currentPillar.secondsTarget, activeElapsedSeconds);
    }
    if (activePhaseIndex === 0) {
      return Math.min(20, activeElapsedSeconds);
    } else if (activePhaseIndex === 1) {
      return Math.min(20, Math.max(0, activeElapsedSeconds - 20));
    } else if (activePhaseIndex === 2) {
      return Math.min(30, Math.max(0, activeElapsedSeconds - 40));
    } else {
      return Math.min(20, Math.max(0, activeElapsedSeconds - 70));
    }
  }, [isFullRun, activePhaseIndex, currentPillar.secondsTarget, activeElapsedSeconds]);

  // Parsed segments for the current part with exact Dot & Dash timestamps
  const pacedSegments = useMemo(() => {
    const rawScript = currentPillar.scriptsByTrack[selectedTrack].withPacing;
    return parsePacedScript(rawScript, currentPillar.secondsTarget);
  }, [currentPillar, selectedTrack]);

  // Current real-time cue state (DASH vs Spoken Word Beat)
  const currentCueState = useMemo(() => {
    const isRunning = isRecording || isPlayingPacing;
    if (!isRunning) {
      return { type: 'idle', label: 'Ready to Practice' };
    }
    const activeSeg = pacedSegments.find(
      (seg) => currentPartElapsed >= seg.startSec && currentPartElapsed < seg.endSec
    ) || pacedSegments[pacedSegments.length - 1];

    if (!activeSeg) {
      return { type: 'idle', label: 'Ready to Practice' };
    }

    if (activeSeg.type === 'dash_pause') {
      const remaining = Math.max(0, activeSeg.endSec - currentPartElapsed).toFixed(1);
      return {
        type: 'dash',
        label: `DASH: PAUSE (${remaining}s)`,
        remainingSec: remaining,
        pauseDuration: activeSeg.pauseDuration
      };
    }

    if (activeSeg.type === 'downtone') {
      return {
        type: 'downtone',
        label: '↓ Grounded Down-Tone (Deliver Now)'
      };
    }

    return {
      type: 'word_beat',
      label: '● ● ● Spoken Word Cadence (135 WPM)'
    };
  }, [isRecording, isPlayingPacing, pacedSegments, currentPartElapsed]);

  const togglePacingPlay = () => {
    if (isPlayingPacing) {
      setIsPlayingPacing(false);
      if (pacingIntervalRef.current) clearInterval(pacingIntervalRef.current);
    } else {
      setIsPlayingPacing(true);
      pacingIntervalRef.current = setInterval(() => {
        setPacingTimer((prev) => {
          const max = isFullRun ? 90 : currentPillar.secondsTarget;
          if (prev >= max) {
            clearInterval(pacingIntervalRef.current);
            setIsPlayingPacing(false);
            return max;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const resetPacing = () => {
    setIsPlayingPacing(false);
    if (pacingIntervalRef.current) clearInterval(pacingIntervalRef.current);
    setPacingTimer(0);
  };

  const handleStartRecording = () => {
    const stream = getRecordingStream();
    if (!stream) {
      alert('Please launch the camera first.');
      return;
    }

    resetPacing();
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    };

    mediaRecorder.start(250);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTimer(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordingTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyScript = () => {
    if (isFullRun) {
      const fullText = CEO_PILLARS.map((p) => {
        const text = showPacingCues
          ? p.scriptsByTrack[selectedTrack].withPacing
          : p.scriptsByTrack[selectedTrack].clean;
        return `【${p.pillarTitle} — ${p.subtitle}】\n${text}`;
      }).join('\n\n');
      navigator.clipboard.writeText(fullText);
    } else {
      const text = showPacingCues
        ? currentPillar.scriptsByTrack[selectedTrack].withPacing
        : currentPillar.scriptsByTrack[selectedTrack].clean;
      navigator.clipboard.writeText(`【${currentPillar.pillarTitle}】\n${text}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedPhrase = (text: string) => {
    const parts = text.split(/(\[EMPHASIZE:\s*.*?\])/gi);
    return (
      <span>
        {parts.map((part, index) => {
          const empMatch = part.match(/^\[EMPHASIZE:\s*(.*?)\]$/i);
          if (empMatch) {
            return (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                title="Emphasize & slow down on key metrics"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 inline shrink-0" />
                <span>{empMatch[1]}</span>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  const activeScript = showPacingCues
    ? currentPillar.scriptsByTrack[selectedTrack].withPacing
    : currentPillar.scriptsByTrack[selectedTrack].clean;
  const wordCount = activeScript.replace(/\[EMPHASIZE:\s*|\[PAUSE\s+[\d.]+s?\]|↓|\]/gi, '').split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 135) * 60);

  const handlePrevPhase = () => {
    if (activePhaseIndex > 0) {
      setActivePhaseIndex(activePhaseIndex - 1);
      resetPacing();
    }
  };

  const handleNextPhase = () => {
    if (activePhaseIndex < CEO_PILLARS.length - 1) {
      setActivePhaseIndex(activePhaseIndex + 1);
      resetPacing();
    }
  };

  const renderTeleprompter = () => (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-slate-800">
      {/* Prompter Top Bar: Header, Part Title, Word count, Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{currentPillar.pillarTitle}</span>
              <span className="text-xs text-blue-600 font-normal">
                ({currentPillar.subtitle.split('(')[0].trim()})
              </span>
            </h3>
            {isFullRun && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Full Run Auto-Advance (Part {activePhaseIndex + 1} of 4)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pace: 130–140 WPM • Natural conversational rhythm with pauses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Font size */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
            <span className="text-[10px] text-slate-500 font-medium">Size:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`text-[10px] px-1 rounded ${fontSize === 'normal' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`text-xs px-1 rounded ${fontSize === 'large' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`text-sm px-1 rounded ${fontSize === 'xl' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              A++
            </button>
          </div>

          {/* Pacing Cues Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={showPacingCues}
              onChange={(e) => setShowPacingCues(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="text-[11px]">Show Pause & Tone Cues</span>
          </label>

          {/* Copy Script */}
          <button
            onClick={handleCopyScript}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Live Rhythm Bar & Ticker */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Part timing and progress meter */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-sky-300 font-bold">PART {currentPillar.pillarNum}:</span>
            <span className="text-white text-sm">{formatTimer(currentPartElapsed)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{currentPillar.secondsTarget}s</span>
          </div>

          {/* Progress Bar */}
          <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentPartElapsed / currentPillar.secondsTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Live Cue Indicator */}
        <div className="flex items-center gap-2">
          {currentCueState.type === 'dash' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-xs animate-pulse shadow-sm">
              <span>━━━━ PAUSE ({currentCueState.remainingSec}s) ━━━━</span>
            </span>
          ) : currentCueState.type === 'downtone' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-bold text-xs animate-pulse">
              <span>↓ Down-Tone Pitch (Deliver Now)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sky-300 font-mono text-xs font-medium">
              <span className="text-sky-400">● ● ●</span>
              <span>Speaking Cadence (135 WPM)</span>
            </span>
          )}
        </div>

        {/* Rehearsal Pacing Controls & Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPhase}
            disabled={activePhaseIndex === 0}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
            title="Previous Part"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePacingPlay}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
              isPlayingPacing
                ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
            }`}
            title={isPlayingPacing ? 'Pause Rehearsal Pacing' : 'Play Prompter Timing Pacing'}
          >
            {isPlayingPacing ? (
              <>
                <Square className="w-3 h-3 text-amber-400" />
                <span>Pause Pace</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Rehearse Pace</span>
              </>
            )}
          </button>

          <button
            onClick={resetPacing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={handleNextPhase}
            disabled={activePhaseIndex === CEO_PILLARS.length - 1}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
            title="Next Part"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The Prompter Screen (ONE PART AT A TIME) */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        {/* Legend Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
          <span className="flex items-center gap-2">
            <span className="text-sky-300 font-semibold">● Dot = 135 WPM Rhythm</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">━━━━ Dash = Pause & Breathe</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">↓ Down-tone = Confident Ending</span>
          </span>
          <span className="text-sky-400 font-bold">
            {wordCount} words • ~{estimatedSeconds}s Target
          </span>
        </div>

        {/* Script Segments */}
        {showPacingCues ? (
          <div className="space-y-2.5 pt-1">
            {pacedSegments.map((seg) => {
              const isSegmentActive =
                (isRecording || isPlayingPacing) &&
                currentPartElapsed >= seg.startSec &&
                currentPartElapsed < seg.endSec;

              if (seg.type === 'dash_pause') {
                const pauseRemaining = Math.max(0, seg.endSec - currentPartElapsed).toFixed(1);
                return (
                  <div
                    key={seg.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSegmentActive
                        ? 'bg-amber-500/25 border-2 border-amber-400 shadow-lg ring-2 ring-amber-400/50 scale-[1.01]'
                        : 'bg-amber-950/40 border border-amber-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className="flex items-center gap-2 text-amber-300 font-bold">
                        <span className="tracking-widest text-amber-400 font-black">━━━━</span>
                        <span>[PAUSE: {seg.pauseDuration}s]</span>
                        <span className="tracking-widest text-amber-400 font-black">━━━━</span>
                      </span>
                      <span className="text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5">
                        {isSegmentActive ? (
                          <span className="flex items-center gap-1.5 text-amber-200 animate-pulse bg-amber-950 px-2.5 py-0.5 rounded border border-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            <span>HOLD SILENCE ({pauseRemaining}s)</span>
                          </span>
                        ) : (
                          <span className="text-amber-300 font-bold">Space & Silence • Hold Eye Contact</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              }

              if (seg.type === 'downtone') {
                return (
                  <div
                    key={seg.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      isSegmentActive
                        ? 'bg-emerald-900/60 border-2 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/50'
                        : 'bg-emerald-950/40 border border-emerald-500/60 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-emerald-400 text-base font-black">↓</span>
                      <span className="text-emerald-400 font-bold">[GROUNDED DOWN-TONE]</span>
                      <span className="text-xs font-semibold text-emerald-200 hidden sm:inline ml-1">
                        End on definitive downward pitch — project authority
                      </span>
                    </div>
                    {isSegmentActive && (
                      <span className="text-[10px] font-mono bg-emerald-900 px-2.5 py-0.5 rounded text-white border border-emerald-400 font-bold animate-pulse">
                        DELIVER NOW
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={seg.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSegmentActive
                      ? 'bg-slate-800 border-2 border-sky-400 shadow-md ring-1 ring-sky-400/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-sky-400 font-bold">
                      <span className="text-xs">● ● ●</span>
                      <span className="uppercase tracking-wider">Word Cadence (135 WPM)</span>
                    </span>
                    {isSegmentActive && (
                      <span className="text-sky-300 bg-slate-950 px-2 py-0.5 rounded border border-sky-400 animate-pulse font-bold">
                        ACTIVE SPOKEN BEAT
                      </span>
                    )}
                  </div>
                  <div
                    className={`leading-relaxed font-sans text-white ${
                      fontSize === 'normal'
                        ? 'text-sm'
                        : fontSize === 'large'
                        ? 'text-base'
                        : 'text-lg font-medium'
                    }`}
                  >
                    {renderHighlightedPhrase(seg.text)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`leading-relaxed font-sans whitespace-pre-line p-4 bg-slate-900 rounded-xl border border-slate-800 text-white font-medium ${
              fontSize === 'normal' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-lg font-medium'
            }`}
          >
            {activeScript}
          </div>
        )}
      </div>

      {/* High-Contrast Delivery Guidance & Vocal Technique Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 shadow-xs">
          <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed font-normal">
            <strong className="text-amber-900 font-bold">Delivery Tip: </strong>
            <span className="text-amber-950 font-medium">{currentPillar.deliveryTip}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-300 flex items-start gap-2.5 shadow-xs">
          <Volume2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 leading-relaxed font-normal">
            <strong className="text-blue-900 font-bold">Vocal Technique: </strong>
            <span className="text-blue-950 font-medium">{currentPillar.vocalTechnique}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoRecorder = () => (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-slate-900">Live Practice Recorder</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>REC {formatTimer(recordingTimer)}</span>
            {isFullRun && <span className="text-gray-400">/ 01:30</span>}
          </div>
        )}
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video max-h-[380px] w-full mx-auto rounded-xl bg-gray-950 border border-gray-800 overflow-hidden flex items-center justify-center">
        {/* Hidden source video element used for webcam frame analysis */}
        <video ref={videoRef} className="hidden" playsInline muted />

        {/* Real-time Canvas Rendering with Background Blur or White Screen */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
        />

        {/* Reticle brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none"></div>

        {isLoadingModel && isCameraActive && (
          <div className="absolute top-3 left-10 bg-cyan-950/80 border border-cyan-700/50 px-2.5 py-1 rounded-lg text-[11px] text-cyan-300 animate-pulse flex items-center gap-1.5 z-10 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Calibrating AI Studio Mask...</span>
          </div>
        )}

        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 text-center">
            <Video className="w-10 h-10 text-cyan-400 mb-2 opacity-80" />
            <p className="text-xs text-gray-300 font-medium mb-1">
              AI Virtual Studio Camera (Blur / White Screen)
            </p>
            <p className="text-[11px] text-gray-400 mb-3 max-w-xs">
              No physical green screen needed. AI separates your background in real-time.
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-cyan-900"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Enable Camera & Mic</span>
            </button>
          </div>
        )}
      </div>

      {/* Studio Backdrop Mode Selector */}
      {isCameraActive && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Studio Backdrop:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBackgroundMode('blur')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                backgroundMode === 'blur'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Soft Bokeh Blur"
            >
              <span>Soft Blur</span>
            </button>
            <button
              onClick={() => setBackgroundMode('white')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                backgroundMode === 'white'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Replace room with clean white executive studio screen"
            >
              <span className="w-2 h-2 rounded-full bg-white border border-slate-400"></span>
              <span>White Screen</span>
            </button>
            <button
              onClick={() => setBackgroundMode('slate')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                backgroundMode === 'slate'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Dark executive studio"
            >
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
              <span>Dark Slate</span>
            </button>
            <button
              onClick={() => setBackgroundMode('none')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                backgroundMode === 'none'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Raw webcam background"
            >
              <span>Original</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={!isCameraActive}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isFullRun ? 'Start Full 90s Run' : `Record Part ${currentPillar.pillarNum} Take`}</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-red-600 text-xs font-semibold transition-colors flex items-center gap-2 border border-red-300 shadow-sm cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop & Review Take</span>
            </button>
          )}
        </div>

        {isCameraActive && (
          <button
            onClick={stopCamera}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Turn Camera Off
          </button>
        )}
      </div>

      {/* Recorded Take Playback */}
      {recordedVideoUrl && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recorded Take Ready for Review
            </span>
            <a
              href={recordedVideoUrl}
              download={`Take_${isFullRun ? 'Full_90s' : `Part_${currentPillar.pillarNum}`}_${Date.now()}.webm`}
              className="text-cyan-400 hover:underline text-[11px]"
            >
              Save to disk
            </a>
          </div>
          <video src={recordedVideoUrl} controls className="w-full rounded-lg aspect-video max-h-[360px]" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Top Banner: Local Recording Destination & Framework Attribution */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shrink-0 gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-slate-500 font-medium">Recordings Destination:</span>
          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            D:\job search\recordings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Practice Studio: 4-Step Introduction</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Video Ready
          </span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTrainerMode('intro')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTrainerMode === 'intro'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>1. Introduction Trainer</span>
        </button>

        <button
          onClick={() => setActiveTrainerMode('communication')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTrainerMode === 'communication'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span>2. Communication Guide</span>
        </button>

        <button
          onClick={() => setActiveTrainerMode('technical')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTrainerMode === 'technical'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>3. Job Questions Trainer</span>
        </button>
      </div>

      {/* MODE 1: INTRODUCTION VIDEO TRAINER */}
      {activeTrainerMode === 'intro' && (
        <div className="space-y-5">
          {/* Track Selector Bar & Speed Guidance */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Track:</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {TRACK_INFO[selectedTrack].badge}
                </span>
              </div>
              <p className="text-xs text-slate-500">{TRACK_INFO[selectedTrack].description}</p>
            </div>

            {/* Track Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink max-w-full">
              {(Object.keys(TRACK_INFO) as TrackKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTrack(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                    selectedTrack === key
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300'
                  }`}
                >
                  {TRACK_INFO[key].label.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Phase Navigation Bar & Layout Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            {/* Pillar Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {CEO_PILLARS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePhaseIndex(idx);
                    setIsFullRun(false);
                    resetPacing();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    activePhaseIndex === idx && !isFullRun
                      ? 'bg-blue-50 border-2 border-blue-500 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{p.pillarTitle}</span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                    {p.timeRange}
                  </span>
                </button>
              ))}

              <button
                onClick={() => {
                  setIsFullRun(true);
                  setActivePhaseIndex(0);
                  resetPacing();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                  isFullRun
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Play className="w-3 h-3 text-emerald-600" />
                <span>Full 90-Second Run</span>
              </button>
            </div>

            {/* Layout Mode Controls */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setLayoutMode('top')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'top'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Prompter at top aligned with camera lens for eye contact"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Top Prompter (Eye-Level)</span>
                </button>
                <button
                  onClick={() => setLayoutMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'split'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Prompter and camera side-by-side"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Side-by-Side</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trainer Stage Viewport: Top Prompter (Eye-Level) or Split Studio */}
          {layoutMode === 'top' ? (
            <div className="space-y-4">
              {renderTeleprompter()}
              <div className="max-w-4xl mx-auto w-full">
                {renderVideoRecorder()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div>{renderTeleprompter()}</div>
              <div className="lg:sticky lg:top-4">{renderVideoRecorder()}</div>
            </div>
          )}

          {/* Reference Card: Model-A Framework Principles */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Why the 4-Part Structure Wins in Professional Interviews
                </h4>
              </div>
              <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                4-Part Method
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">1. What You Do</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Start with your clear professional title, functional ownership, and scope in seconds.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">2. Who You Help</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focus on solving team and customer pain. Position yourself as a problem solver.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">3. How You Help</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide proof with real results: process improvements, automated steps, and time saved.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900">4. Why You Stand Out</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your competitive edge: deep experience, consistency, and a high-ownership mindset.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: COMMUNICATION TRAINER (EXECUTIVE SPEECH MASTERCLASS) */}
      {activeTrainerMode === 'communication' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Executive Public Speaking Rules (Model-A Core Principles)</h3>
              <p className="text-xs text-gray-400">Master vocal tonality, silence, and high-status response framing.</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2.5 py-1 rounded border border-purple-800/40">
              High-Status Delivery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Rule 1: Downward Inflection vs Uptalk</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Never raise your pitch at the end of statements as if asking for permission. Drop your pitch downwards.
                Ending on a solid, grounded tone signals absolute conviction and certainty in your achievements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Rule 2: Strategic Silence is Power</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Junior candidates fear silence and fill it with "um", "like", and "basically". Executive leaders pause for 1-2
                seconds before answering difficult questions. Pausing conveys contemplation, weight, and poise.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Rule 3: The Pyramid Principle in Answers</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Always state the headline conclusion and the quantified bottom line first (e.g., "We boosted SLA compliance by 60%"),
                followed by the technical architecture. Never make stakeholders wait 5 minutes to understand the punchline.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Rule 4: Zero Hedging & Zero Disclaimers</span>
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Eliminate phrases like "I was kind of just doing...", "Basically my role was...", or "I don't know if this makes sense".
                Speak with clear ownership: "I architected...", "I resolved...", "I led cross-functional triage...".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: TECHNICAL TRAINER */}
      {activeTrainerMode === 'technical' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <h4 className="text-sm font-bold text-white">SQL Performance & Lock RCA</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explain how you isolate blocking transactions, read query plans, and replace nested cursors with batch CTEs.
              Demonstrate how your 130+ stored procedures were benchmarked under strict production SLAs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <h4 className="text-sm font-bold text-white">L2/L3 Incident Governance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Walk through how you triage high-severity claims staging discrepancies under 15-minute SLA windows,
              coordinate across 200 Jira resolver groups, and write post-mortem preventative SOPs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <h4 className="text-sm font-bold text-white">Autonomous Agentic Architecture</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Describe building autonomous LLM tool-calling pipelines, deterministic schema enforcement, and real-time
              streaming engines—combining enterprise stability with modern AI engineering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
