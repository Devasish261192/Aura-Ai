import { useRef, useState, useEffect, useCallback } from 'react';

export type BackgroundMode = 'none' | 'blur' | 'white' | 'slate';

interface UseVirtualBackgroundReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  isLoadingModel: boolean;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  getRecordingStream: () => MediaStream | null;
}

// Dynamically load Google MediaPipe scripts via CDN to avoid Vite UMD bundling issues
async function loadMediaPipeScripts(): Promise<void> {
  const loadScript = (src: string, globalName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any)[globalName]) {
        resolve();
        return;
      }
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
      if (existing) {
        if ((window as any)[globalName]) {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  await Promise.all([
    loadScript(
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'Camera'
    ),
    loadScript(
      'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js',
      'SelfieSegmentation'
    )
  ]);
}

export function useVirtualBackground(): UseVirtualBackgroundReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const cameraHelperRef = useRef<any>(null);
  const segmenterRef = useRef<any>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('blur');

  // Ref to track current background mode inside the requestAnimationFrame callback
  const bgModeRef = useRef<BackgroundMode>(backgroundMode);
  useEffect(() => {
    bgModeRef.current = backgroundMode;
  }, [backgroundMode]);

  // Frame processing callback from MediaPipe
  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
      canvas.width = results.image.width;
      canvas.height = results.image.height;
    }

    const mode = bgModeRef.current;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    if (mode === 'none') {
      // Direct camera rendering without segmentation
      ctx.drawImage(results.image, 0, 0, w, h);
    } else {
      // 1. Draw segmentation mask to canvas
      ctx.drawImage(results.segmentationMask, 0, 0, w, h);

      // 2. Keep only the user where the mask is present
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(results.image, 0, 0, w, h);

      // 3. Draw replacement background behind the user
      ctx.globalCompositeOperation = 'destination-over';

      if (mode === 'blur') {
        // High-quality executive bokeh blur (Google Meet style)
        ctx.filter = 'blur(16px)';
        ctx.drawImage(results.image, 0, 0, w, h);
        ctx.filter = 'none';
      } else if (mode === 'white') {
        // High-key Executive White Studio Backdrop (subtle top-to-bottom drop)
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (mode === 'slate') {
        // Modern Executive Slate Tech Studio Backdrop
        const grad = ctx.createRadialGradient(w / 2, h * 0.4, 40, w / 2, h * 0.4, w * 0.8);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.restore();
  }, []);

  // Initialize MediaPipe Selfie Segmentation
  const initSegmenter = useCallback(async () => {
    if (segmenterRef.current) return segmenterRef.current;

    setIsLoadingModel(true);
    try {
      await loadMediaPipeScripts();

      const SelfieSegmentationClass = (window as any).SelfieSegmentation;
      if (!SelfieSegmentationClass) {
        throw new Error('SelfieSegmentation is not available on window.');
      }

      const segmenter = new SelfieSegmentationClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      segmenter.setOptions({
        modelSelection: 1, // 1 = landscape/full-body desktop webcam mode
        selfieMode: true,  // mirrors the video horizontally
      });

      segmenter.onResults(onResults);
      segmenterRef.current = segmenter;
      return segmenter;
    } catch (err) {
      console.error('Failed to initialize MediaPipe SelfieSegmentation:', err);
      throw err;
    } finally {
      setIsLoadingModel(false);
    }
  }, [onResults]);

  // Start Camera and Video Processing Loop
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      rawStreamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();

      await initSegmenter();

      const CameraClass = (window as any).Camera;
      if (!CameraClass) {
        throw new Error('Camera utility is not available on window.');
      }

      const cameraHelper = new CameraClass(video, {
        onFrame: async () => {
          if (video && video.readyState >= 2 && segmenterRef.current) {
            await segmenterRef.current.send({ image: video });
          }
        },
        width: 1280,
        height: 720
      });

      cameraHelper.start();
      cameraHelperRef.current = cameraHelper;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera startup error:', err);
      alert('Could not access camera/microphone. Please ensure permissions are granted in browser.');
    }
  }, [initSegmenter]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (cameraHelperRef.current) {
      try {
        cameraHelperRef.current.stop();
      } catch (e) {
        // ignore
      }
      cameraHelperRef.current = null;
    }

    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach((track) => track.stop());
      rawStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Provides the stream to record (canvas stream with background applied + mic audio)
  const getRecordingStream = useCallback((): MediaStream | null => {
    const rawStream = rawStreamRef.current;
    const canvas = canvasRef.current;

    if (!rawStream) return null;

    if (bgModeRef.current === 'none' || !canvas) {
      return rawStream;
    }

    try {
      const canvasStream = canvas.captureStream(30);
      const audioTrack = rawStream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }
      return canvasStream;
    } catch (e) {
      console.warn('captureStream fallback to raw stream:', e);
      return rawStream;
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    isLoadingModel,
    backgroundMode,
    setBackgroundMode,
    startCamera,
    stopCamera,
    getRecordingStream
  };
}
