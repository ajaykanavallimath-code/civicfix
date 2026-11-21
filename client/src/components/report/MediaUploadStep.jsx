import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Upload, 
  Mic, 
  Square, 
  Trash2, 
  Play, 
  Pause, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Video,
  X,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

export default function MediaUploadStep({ 
  selectedFile, 
  previewUrl, 
  onFileSelect, 
  onFileRemove,
  citizenNote,
  onNoteChange,
  audioBlob,
  onAudioRecorded,
  onAudioClear
}) {
  const { t } = useTranslation();
  
  // Hidden inputs for various triggers
  const galleryInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioRef = useRef(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Desktop Camera Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Detect Mobile device on mount
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    setIsMobileDevice(isMobile);
  }, []);

  const {
    isRecording,
    recordingTime,
    audioBlob: recorderBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearAudio
  } = useAudioRecorder();

  const handleStopRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    if (recorderBlob) {
      onAudioRecorded(recorderBlob, audioUrl);
    }
  }, [recorderBlob, audioUrl]);

  const handleAudioClear = () => {
    clearAudio();
    onAudioClear();
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // 1. "Take Photo" Action
  const handleTakePhotoClick = () => {
    if (isMobileDevice) {
      // Mobile: open native device camera directly
      mobileCameraInputRef.current?.click();
    } else {
      // Desktop: open in-app camera modal using getUserMedia
      openDesktopCamera();
    }
  };

  // 2. Open Desktop Camera Stream
  const openDesktopCamera = async () => {
    setCameraError(null);
    setCapturedBlob(null);
    setCapturedDataUrl(null);
    setCameraModalOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser or insecure connection.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play warning:', e));
      }
    } catch (err) {
      console.warn('getUserMedia error:', err);
      let msg = 'Could not access camera. Please allow camera permissions or upload an image from your gallery.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings, or upload from gallery.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system. You can upload an image from gallery instead.';
      }
      setCameraError(msg);
    }
  };

  // When camera stream is ready, attach to video element
  useEffect(() => {
    if (cameraStream && videoRef.current && !capturedDataUrl) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video play:', e));
    }
  }, [cameraStream, capturedDataUrl, cameraModalOpen]);

  // Capture current video frame
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        const dataUrl = URL.createObjectURL(blob);
        setCapturedDataUrl(dataUrl);
      }
    }, 'image/jpeg', 0.92);
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedDataUrl) URL.revokeObjectURL(capturedDataUrl);
    setCapturedBlob(null);
    setCapturedDataUrl(null);
  };

  // Use captured photo
  const handleUseCapturedPhoto = () => {
    if (!capturedBlob) return;

    const file = new File([capturedBlob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onFileSelect(file);
    closeDesktopCamera();
  };

  // Stop camera stream & close modal
  const closeDesktopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (capturedDataUrl) {
      URL.revokeObjectURL(capturedDataUrl);
    }
    setCapturedBlob(null);
    setCapturedDataUrl(null);
    setCameraError(null);
    setCameraModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden File Inputs */}
      {/* 1. Mobile Camera Input (forces environment camera) */}
      <input
        type="file"
        ref={mobileCameraInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 2. Upload from Gallery / Files */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        accept="image/*"
        className="hidden"
      />

      {/* 3. Record Video Input */}
      <input
        type="file"
        ref={videoInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        accept="video/*"
        capture="environment"
        className="hidden"
      />

      {/* Media Evidence Preview or Action Card */}
      {selectedFile ? (
        <div className="civic-card p-4 space-y-3 border-2 border-emerald-500/50 bg-emerald-50/10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Evidence Attached ({selectedFile.type?.startsWith('video/') ? 'Video' : 'Photo'})</span>
            </span>
            <button
              type="button"
              onClick={onFileRemove}
              className="civic-tap-target px-3 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
            {selectedFile.type?.startsWith('video/') ? (
              <video src={previewUrl} controls className="w-full h-full object-cover" />
            ) : (
              <img src={previewUrl} alt="Report preview" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold truncate max-w-[240px]">{selectedFile.name}</span>
            <span className="font-mono font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Button 1: Take Photo */}
            <button
              type="button"
              onClick={handleTakePhotoClick}
              className="civic-tap-target p-4 rounded-2xl bg-civic-navy hover:bg-civic-navy-light text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-2 shadow-soft transition-all duration-150 hover:scale-[1.02] active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-civic-gold text-civic-navy flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-civic-navy" />
              </div>
              <span className="font-extrabold">Take Photo</span>
              <span className="text-[10px] text-slate-300 font-normal">
                {isMobileDevice ? 'Opens camera directly' : 'In-app webcam preview'}
              </span>
            </button>

            {/* Button 2: Upload from Gallery */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="civic-tap-target p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-2 shadow-soft transition-all duration-150 hover:scale-[1.02] active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-slate-700" />
              </div>
              <span className="font-extrabold text-slate-900">Upload from Gallery</span>
              <span className="text-[10px] text-slate-500 font-normal">Choose existing file</span>
            </button>

            {/* Button 3: Record Video */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="civic-tap-target p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-2 shadow-soft transition-all duration-150 hover:scale-[1.02] active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 text-slate-700" />
              </div>
              <span className="font-extrabold text-slate-900">Record Video</span>
              <span className="text-[10px] text-slate-500 font-normal">Short video evidence</span>
            </button>

          </div>

          {/* Voice Note Recording Strip */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            audioUrl 
              ? 'border-amber-400 bg-amber-50/40' 
              : isRecording 
              ? 'border-red-500 bg-red-50/20 animate-pulse' 
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-soft transition-colors shrink-0 ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-bounce' 
                    : audioUrl 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{t('report.voice_note')}</p>
                  <p className="text-[11px] text-slate-500">
                    {isRecording 
                      ? `Recording in Kannada/Hindi/English (${recordingTime}s)...` 
                      : audioUrl 
                      ? 'Voice note attached' 
                      : 'Record problem details in Kannada, Hindi, or English'}
                  </p>
                </div>
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="civic-tap-target px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shrink-0"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording ({recordingTime}s)</span>
                </button>
              ) : audioUrl ? (
                <div className="flex items-center gap-2 shrink-0">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="civic-tap-target px-3.5 py-1.5 rounded-xl bg-civic-navy text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAudioClear}
                    className="civic-tap-target p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete audio note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="civic-tap-target px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-civic-navy text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Record Voice Note</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Optional Text Details */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('report.optional_notes')}</span>
        </label>
        <textarea
          rows={2}
          value={citizenNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={t('report.notes_placeholder')}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-civic-navy bg-white shadow-xs resize-none"
        />
      </div>

      {/* In-App Desktop Camera Modal */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-elevated border border-slate-700 max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-civic-gold" />
                <h3 className="font-extrabold text-sm text-white">Live Camera Capture</h3>
              </div>
              <button
                type="button"
                onClick={closeDesktopCamera}
                className="civic-tap-target p-1 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder / Captured Frame Container */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-3 max-w-xs">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      closeDesktopCamera();
                      galleryInputRef.current?.click();
                    }}
                    className="civic-tap-target px-4 py-2 rounded-xl bg-civic-gold text-civic-navy text-xs font-bold"
                  >
                    Upload from Gallery Instead
                  </button>
                </div>
              ) : capturedDataUrl ? (
                <img
                  src={capturedDataUrl}
                  alt="Captured frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Hidden canvas for taking snapshot */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Modal Controls Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              {cameraError ? (
                <button
                  type="button"
                  onClick={closeDesktopCamera}
                  className="w-full civic-tap-target py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Close
                </button>
              ) : capturedDataUrl ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="civic-tap-target px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseCapturedPhoto}
                    className="flex-1 civic-tap-target px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Use Photo</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeDesktopCamera}
                    className="civic-tap-target px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureFrame}
                    className="flex-1 civic-tap-target px-6 py-3 rounded-2xl bg-civic-gold hover:bg-amber-400 text-civic-navy text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-elevated transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-civic-navy" />
                    <span>Capture Photo</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
