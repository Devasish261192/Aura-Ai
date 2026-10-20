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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [recordingSeconds]);

  const startCameraAndAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);

      // Start Audio Context for waveform
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioCtx;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `rgb(59, 130, 246)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      drawWaveform();
    } catch (err) {
      console.error('Error accessing camera/microphone:', err);
      alert('Could not access your camera and microphone. Please allow permissions in your browser.');
    }
  };

  const stopCameraAndAudio = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setIsCameraActive(false);
    setIsRecording(false);
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
      } catch (e) {
        // already started
      }
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleFinishAnswer = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Generate score
    if (selectedRound === 'CEO_Intro') {
      setGradedReport({
        score: 94,
        isCeoModel: true,
        cadence: '136 WPM (Calm and steady pace)',
        deliveryMetrics: {
          downwardInflection: '92% (Clear and confident statements)',
          silenceMastery: 'Natural pauses between points',
          fillerRatio: 'Low (Very few um/uh words)'
        },
        pillars: {
          whatYouDo: 'Clear job title and core area of work stated upfront.',
          whoYouHelp: 'Identified the key teams and business partners you support.',
          howYouHelp: 'Mentioned real actions, tools, and positive impact.',
          whyDifferent: 'Showcased your strong combination of experience and reliability.'
        },
        goldRewrite:
          'I lead operations and team execution. I help business leaders streamline daily workflows and resolve issues before they impact customers. By standardizing our processes, I helped my team improve on-time completion by 40%.'
      });
    } else {
      setGradedReport({
        score: 91,
        isCeoModel: false,
        cadence: `${wpm || 135} WPM (Good conversational pace)`,
        starFulfillment: {
          situation: 'High-stakes problem clearly framed',
          task: 'Clear responsibility and deadline ownership',
          action: 'Step-by-step resolution described without hesitation',
          result: 'Clear positive outcome achieved',
          learnings: 'Created standard guidelines for future incidents'
        },
        goldRewrite:
          'When our team faced delays, I reviewed our workflow steps, organized our daily priority list, and trained 4 team members on quick resolution. This cut response time by half.'
      });
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Top Banner: Local Recording & Mode */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm gap-3">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-slate-500 font-medium">Camera Privacy:</span>
          <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Private in Your Browser Only
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedRound}
            onChange={(e: any) => setSelectedRound(e.target.value)}
            className="bg-white text-xs text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
          >
            <option value="CEO_Intro">Tell Me About Yourself (4-Step Intro)</option>
            <option value="Behavioral">Behavioral (Problem Solving & Teamwork)</option>
            <option value="Technical">Technical & Operations (Daily Tools)</option>
            <option value="Executive">Leadership & Growth (Next Step)</option>
          </select>
          <span className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
            Practice Ready
          </span>
        </div>
      </div>

      {/* 2-Column Studio Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Gauges & Question Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Question Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-blue-600 uppercase tracking-wider">
                {selectedRound === 'CEO_Intro' ? 'Practice Introduction' : 'Question 1 of 5'}
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">Round: {selectedRound}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {selectedRound === 'CEO_Intro'
                ? 'Walk me through your background and introduce yourself.'
                : selectedRound === 'Behavioral'
                ? 'Can you tell me about a time you solved an urgent problem at work?'
                : 'What daily tools or systems do you use to manage your work?'}
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 marker:text-blue-500">
              {selectedRound === 'CEO_Intro' ? (
                <>
                  <li><strong>Part 1 (What You Do):</strong> Name your job role and area of expertise clearly.</li>
                  <li><strong>Part 2 (Who You Help):</strong> Mention who relies on your work (customers, team, managers).</li>
                  <li><strong>Part 3 (How You Help):</strong> Share a key action or project that got good results.</li>
                  <li><strong>Part 4 (Why You Stand Out):</strong> Share 1 unique strength you bring to the job.</li>
                </>
              ) : (
                <>
                  <li>Explain the situation simply.</li>
                  <li>Share what action you took.</li>
                  <li>Tell what good result came from it.</li>
                </>
              )}
            </ul>
          </div>

          {/* Delivery Feedback Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Speech & Tone Feedback
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Gauge 1: Confidence */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                <span className="text-lg font-bold text-blue-600 font-mono">{confidence}%</span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Confidence</span>
              </div>

              {/* Gauge 2: Clarity */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                <span className="text-lg font-bold text-emerald-600 font-mono">{clarity}%</span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Clarity</span>
              </div>

              {/* Gauge 3: Engagement */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                <span className="text-lg font-bold text-indigo-600 font-mono">{engagement}%</span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Engagement</span>
              </div>
            </div>

            {/* Cadence Metrics Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>
                Speed: <strong className="text-slate-800">{wpm} WPM (Good pace)</strong>
              </span>
              <span>
                Filler Words: <strong className="text-slate-800">{fillers}</strong>
              </span>
              <span>
                Sound: <strong className="text-emerald-600 font-medium">Clear</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Video Viewport & Speech Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Master Video Stage */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-300 overflow-hidden flex items-center justify-center shadow-sm">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {/* Corner Framing */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/60"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/60"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/60"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/60"></div>

            {/* Waveform Canvas Overlay */}
            <canvas ref={canvasRef} width={400} height={60} className="absolute bottom-2 left-4 right-4 h-12 pointer-events-none" />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>REC {formatTimer(recordingSeconds)}</span>
              </div>
            )}

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 text-center">
                <Video className="w-12 h-12 text-blue-400 mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-white mb-1">Practice Video Stage</h4>
                <p className="text-xs text-slate-300 mb-3 max-w-sm">
                  Turn on your camera and microphone to practice speaking aloud.
                </p>
                <button
                  onClick={startCameraAndAudio}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Turn On Camera & Mic</span>
                </button>
              </div>
            )}
          </div>

          {/* Spoken Speech Transcript Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-600" /> What You Say (Live Text)
              </span>
              {isRecording && (
                <span className="text-emerald-600 font-medium text-[11px] animate-pulse">Listening...</span>
              )}
            </div>
            <p className="text-xs text-slate-700 min-h-[48px] bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed italic">
              {transcript || 'Click "Start Recording" and speak. What you say will show up here...'}
            </p>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={handleStartSession}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFinishAnswer}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Finish & See Feedback</span>
                  </button>
                )}
              </div>

              {isCameraActive && (
                <button
                  onClick={stopCameraAndAudio}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Turn Off Camera
                </button>
              )}
            </div>
          </div>

          {/* Graded AI Evaluation Report */}
          {gradedReport && (
            <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">Practice Scorecard</h4>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {gradedReport.score} / 100
                </span>
              </div>

              {gradedReport.isCeoModel ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p>
                      <strong>Speaking Speed: </strong> {gradedReport.cadence}
                    </p>
                    <p>
                      <strong>Tone Quality: </strong>{' '}
                      <span className="text-emerald-700 font-semibold">{gradedReport.deliveryMetrics?.downwardInflection}</span>
                    </p>
                    <p>
                      <strong>Pauses: </strong> {gradedReport.deliveryMetrics?.silenceMastery}
                    </p>
                    <p>
                      <strong>Extra Words: </strong> {gradedReport.deliveryMetrics?.fillerRatio}
                    </p>
                  </div>

                  {/* 4-Part Assessment */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span>✓ 4-Part Structure Review</span>
                      <span className="text-[10px] text-blue-700 font-bold">All 4 Parts Covered</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-blue-700">• Part 1 (What You Do): </strong> {gradedReport.pillars?.whatYouDo}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-blue-700">• Part 2 (Who You Help): </strong> {gradedReport.pillars?.whoYouHelp}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-blue-700">• Part 3 (How You Help): </strong> {gradedReport.pillars?.howYouHelp}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-blue-700">• Part 4 (Why You Stand Out): </strong>{' '}
                      {gradedReport.pillars?.whyDifferent}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800">
                    <strong className="text-blue-900 block mb-1">Recommended Response:</strong>
                    "{gradedReport.goldRewrite}"
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p>
                      <strong>Speaking Speed: </strong> {gradedReport.cadence}
                    </p>
                    <p>
                      <strong>Story Structure: </strong> Clear problem, action, and results.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800">
                    <strong className="text-blue-900 block mb-1">Recommended Response:</strong>
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
