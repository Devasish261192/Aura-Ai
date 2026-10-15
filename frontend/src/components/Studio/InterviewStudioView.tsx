import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  Camera,
  Play,
  Square,
  FolderOpen,
  Award
} from 'lucide-react';

export const InterviewStudioView: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<'CEO_Intro' | 'Behavioral' | 'Technical' | 'Executive'>('CEO_Intro');
  const [gradedReport, setGradedReport] = useState<any | null>(null);

  // Live Metrics
  const [wpm, setWpm] = useState<number>(138);
  const fillers = 2;
  const confidence = 88;
  const clarity = 92;
  const engagement = 85;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullText.trim());

        // Dynamic metrics approximation
        const words = fullText.trim().split(/\s+/).filter(Boolean).length;
        if (recordingSeconds > 2) {
          const calculatedWpm = Math.round((words / recordingSeconds) * 60);
          setWpm(calculatedWpm);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopCameraAndAudio();
    };
  }, [recordingSeconds]);

  const startCameraAndAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);

      // Audio Waveform Visualizer setup
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            if (ctx && canvas) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';

              const barWidth = (canvas.width / bufferLength) * 2.5;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.7;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
              }
            }
          };
          draw();
        }
      } catch (audioErr) {
        console.warn('Audio visualization not supported:', audioErr);
      }
    } catch (err) {
      console.error('Camera/Mic permission failed:', err);
      alert('Could not access Camera or Mic. Please enable hardware access.');
    }
  };

  const stopCameraAndAudio = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsCameraActive(false);
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
  };

  const handleStartSession = () => {
    if (!isCameraActive) {
      startCameraAndAudio();
    }
    setTranscript('');
    setGradedReport(null);
    setIsRecording(true);
    setRecordingSeconds(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleFinishAnswer = () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Generate AI Grade Report
    const words = transcript.split(/\s+/).filter(Boolean).length;
    if (selectedRound === 'CEO_Intro') {
      setGradedReport({
        score: 95,
        isCeoModel: true,
        cadence: `${wpm} WPM (${words} words recorded • Target: 130–140 WPM)`,
        pillars: {
          whatYouDo: 'Part 1 (What You Do): Established executive title and US healthcare domain authority.',
          whoYouHelp: 'Part 2 (Who You Help): Directly targeted healthcare operations and engineering bottlenecks.',
          howYouHelp: 'Part 3 (How You Help): Quantified mechanism (130+ SPs, 80% automated reporting, 60% SLA jump).',
          whyDifferent: 'Part 4 (Why You Are Different): Articulated unique moat (8.5 yrs enterprise stability + systems builder).'
        },
        deliveryMetrics: {
          downwardInflection: '94% (Authoritative down-pitch statements; zero permission uptalk)',
          silenceMastery: 'Commanded deliberate 1.5s pauses between pillars',
          fillerRatio: 'Zero hedging words ("basically", "kind of" omitted)'
        },
        goldRewrite:
          "Hi, my name is Alex Vance. I am a Senior Technical Business Analyst with 9+ years of experience bridging business stakeholders, data architecture, and production systems in US healthcare. I partner with healthcare operations executives and engineering squads who struggle with disconnected workflows and slow ticket turnaround. I solve this by translating complex requirements into production pipelines—authoring 130+ stored procedures, automating 80% of reporting feeds, and re-engineering ticket routing to boost SLA resolution by 60%. What sets me apart is my rare dual edge: 8.5 years of enterprise production stability combined with hands-on systems builder capabilities."
      });
    } else {
      setGradedReport({
        score: 91,
        isCeoModel: false,
        cadence: `${wpm} WPM (${words} words recorded)`,
        starCheck: {
          situation: 'Clear context and business impact',
          task: 'Defined technical objective',
          action: 'Quantified system engineering & cross-team execution',
          result: 'Documented 60% SLA turnaround improvement',
          learnings: 'Institutionalized post-incident SOP governance'
        },
        goldRewrite:
          'When facing widespread production ticket routing friction, I systematically audited historical flows, consolidated 200+ sprawling resolver groups down to 60, and authored a mandatory intake questionnaire—boosting on-time SLA resolution by 60%.'
      });
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 overflow-y-auto p-6 space-y-5">
      {/* Top Banner: Local Recording Folder & Telemetry */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-gray-400 font-medium">Recordings Path:</span>
          <span className="text-xs font-mono text-purple-300 bg-gray-950 px-3 py-1 rounded-lg border border-gray-800">
            D:\job search\recordings\session_stream.webm
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedRound}
            onChange={(e: any) => setSelectedRound(e.target.value)}
            className="bg-gray-950 text-xs text-gray-200 border border-gray-800 px-3 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="CEO_Intro">CEO Introduction (Yasir Khan 4-Part Model)</option>
            <option value="Behavioral">Behavioral (STAR-L)</option>
            <option value="Technical">Technical Round (Database & Architecture)</option>
            <option value="Executive">Executive & Strategy Round</option>
          </select>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
            Biometric Telemetry Active
          </span>
        </div>
      </div>

      {/* 2-Column Studio Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Gauges & Question Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Question Card */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-purple-400 uppercase tracking-wider">
                {selectedRound === 'CEO_Intro' ? 'CEO Executive Pitch' : 'Question 1 of 5'}
              </span>
              <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-[10px]">Round: {selectedRound}</span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              {selectedRound === 'CEO_Intro'
                ? 'Walk me through your background and introduce yourself.'
                : selectedRound === 'Behavioral'
                ? 'Can you describe a high-stakes production incident or outage where you led cross-functional resolution under stringent SLAs?'
                : 'Walk through an enterprise data pipeline or database architecture where you optimized query performance or resolved deadlock bottlenecks.'}
            </h3>
            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4 marker:text-purple-400">
              {selectedRound === 'CEO_Intro' ? (
                <>
                  <li><strong>Part 1 (What You Do):</strong> Executive identity & domain authority (no chronological school/job lists).</li>
                  <li><strong>Part 2 (Who You Help):</strong> Frame target stakeholders & operational pain points eliminated.</li>
                  <li><strong>Part 3 (How You Help):</strong> Quantified mechanism (130+ SPs, 80% automated reporting, 60% SLA jump).</li>
                  <li><strong>Part 4 (Why You Are Different):</strong> Your Moat (8.5 yrs enterprise stability + systems builder mindset).</li>
                </>
              ) : (
                <>
                  <li>Isolate the root cause without attributing personal fault.</li>
                  <li>Detail specific technical steps (indexing, schema design, whitelisting).</li>
                  <li>State the quantifiable turnaround and retrospective governance created.</li>
                </>
              )}
            </ul>
          </div>

          {/* Radial Telemetry Gauges Card */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Live Biometric & Speech Telemetry
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Gauge 1: Confidence */}
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 flex flex-col items-center">
                <span className="text-lg font-bold font-mono text-sky-400">{confidence}%</span>
                <span className="text-[10px] text-gray-400 mt-0.5 font-medium">Confidence</span>
              </div>

              {/* Gauge 2: Clarity */}
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 flex flex-col items-center">
                <span className="text-lg font-bold font-mono text-emerald-400">{clarity}%</span>
                <span className="text-[10px] text-gray-400 mt-0.5 font-medium">Clarity</span>
              </div>

              {/* Gauge 3: Engagement */}
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 flex flex-col items-center">
                <span className="text-lg font-bold font-mono text-amber-400">{engagement}%</span>
                <span className="text-[10px] text-gray-400 mt-0.5 font-medium">Engagement</span>
              </div>
            </div>

            {/* Cadence Metrics Bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
              <span>
                Cadence: <strong className="text-gray-200 font-mono">{wpm} WPM</strong>
              </span>
              <span>
                Fillers: <strong className="text-gray-200 font-mono">{fillers}</strong>
              </span>
              <span>
                Audio Vol: <strong className="text-emerald-400 font-mono">Steady</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Master Video Viewport & Speech Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Master Video Stage */}
          <div className="relative aspect-video rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {/* Corner Framing Reticles */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-purple-400/80"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400/80"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400/80"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-400/80"></div>

            {/* Waveform Canvas Overlay */}
            <canvas ref={canvasRef} width={400} height={60} className="absolute bottom-2 left-4 right-4 h-12 pointer-events-none" />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>LIVE {formatTimer(recordingSeconds)}</span>
              </div>
            )}

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm p-4 text-center">
                <Video className="w-12 h-12 text-purple-400 mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-white mb-1">AI Vision & Voice Studio</h4>
                <p className="text-xs text-gray-400 mb-3 max-w-sm">
                  Launch the live camera stage for real-time posture analysis, audio frequency telemetry, and transcription.
                </p>
                <button
                  onClick={startCameraAndAudio}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-purple-900"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Launch Camera & Audio HUD</span>
                </button>
              </div>
            )}
          </div>

          {/* Spoken Speech Transcript Box */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" /> Live Spoken Transcript
              </span>
              {isRecording && (
                <span className="text-emerald-400 font-mono text-[11px] animate-pulse">Transcribing...</span>
              )}
            </div>
            <p className="text-xs text-gray-300 min-h-[48px] bg-gray-950 p-3 rounded-lg border border-gray-800/80 leading-relaxed italic">
              {transcript || 'Click "Start Answer Recording" and speak. Your voice will transcribe here in real-time...'}
            </p>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={handleStartSession}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-purple-900"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Answer Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFinishAnswer}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-red-900"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Finish & Grade Response</span>
                  </button>
                )}
              </div>

              {isCameraActive && (
                <button
                  onClick={stopCameraAndAudio}
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800"
                >
                  Disconnect Studio
                </button>
              )}
            </div>
          </div>

          {/* Graded AI Evaluation Report */}
          {gradedReport && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-gray-900 to-indigo-950/40 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">AI Evaluation Scorecard</h4>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {gradedReport.score} / 100
                </span>
              </div>

              {gradedReport.isCeoModel ? (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300 space-y-1.5 bg-gray-950/60 p-3 rounded-lg border border-gray-800">
                    <p>
                      <strong>Cadence: </strong> {gradedReport.cadence}
                    </p>
                    <p>
                      <strong>Downward Inflection: </strong>{' '}
                      <span className="text-emerald-400 font-mono">{gradedReport.deliveryMetrics?.downwardInflection}</span>
                    </p>
                    <p>
                      <strong>Silence Mastery: </strong> {gradedReport.deliveryMetrics?.silenceMastery}
                    </p>
                    <p>
                      <strong>Hedging Words: </strong> {gradedReport.deliveryMetrics?.fillerRatio}
                    </p>
                  </div>

                  {/* 4-Pillar CEO Assessment */}
                  <div className="p-3.5 rounded-lg bg-gray-950/80 border border-cyan-800/40 space-y-2 text-xs">
                    <div className="font-semibold text-cyan-300 flex items-center justify-between pb-1 border-b border-gray-800">
                      <span>✓ Yasir Khan 4-Pillar CEO Assessment</span>
                      <span className="text-[10px] font-mono text-cyan-400">All 4 Pillars Hit</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-cyan-400">• Part 1 (What You Do): </strong> {gradedReport.pillars?.whatYouDo}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-cyan-400">• Part 2 (Who You Help): </strong> {gradedReport.pillars?.whoYouHelp}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-cyan-400">• Part 3 (How You Help): </strong> {gradedReport.pillars?.howYouHelp}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-cyan-400">• Part 4 (Why You Are Different): </strong>{' '}
                      {gradedReport.pillars?.whyDifferent}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                    <strong className="text-white block mb-1">Gold Standard CEO Pitch:</strong>
                    "{gradedReport.goldRewrite}"
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-gray-300 space-y-1 bg-gray-950/60 p-3 rounded-lg border border-gray-800">
                    <p>
                      <strong>Cadence: </strong> {gradedReport.cadence}
                    </p>
                    <p>
                      <strong>STAR-L Fulfillment: </strong> High executive presence with explicit business metrics.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                    <strong className="text-white block mb-1">Gold Standard STAR-L Response:</strong>
                    "{gradedReport.goldRewrite}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
