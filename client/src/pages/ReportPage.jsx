import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Camera, 
  MapPin, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import MediaUploadStep from '../components/report/MediaUploadStep';
import LocationPickerStep from '../components/report/LocationPickerStep';
import SubmissionProgress from '../components/report/SubmissionProgress';
import TriageResultCard from '../components/report/TriageResultCard';
import DemoModeButton from '../components/report/DemoModeButton';
import { useGeolocation } from '../hooks/useGeolocation';

export default function ReportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { coords, loading: geoLoading, error: geoError, detectLocation, updateLocation } = useGeolocation();

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [citizenNote, setCitizenNote] = useState('');
  
  // UI & Submission state
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [resultComplaint, setResultComplaint] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-trigger demo mode if ?demo=true
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      applyDemoScenario({
        type: 'water_leak',
        lat: 14.9688,
        lng: 75.3435,
        address: 'Near Savanur Community Health Centre, Hospital Road',
        note: 'High-pressure clean water gushing onto the road from broken municipal pipeline.',
        seedImg: '/seed/water-leak-1.svg',
        fileName: 'chc_water_burst.svg'
      });
    }
  }, [searchParams]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMessage(null);
  };

  const handleFileRemove = () => {
    if (previewUrl && !previewUrl.startsWith('/seed')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAudioRecorded = (blob, url) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setErrorMessage(null);
  };

  const handleAudioClear = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const applyDemoScenario = async (scenario) => {
    updateLocation(scenario.lat, scenario.lng, scenario.address);
    setCitizenNote(scenario.note);
    
    // Fetch seed image as a Blob so it can be uploaded as real multipart file
    try {
      const res = await fetch(scenario.seedImg);
      const blob = await res.blob();
      const demoFile = new File([blob], scenario.fileName, { type: 'image/svg+xml' });
      setSelectedFile(demoFile);
      setPreviewUrl(scenario.seedImg);
    } catch (e) {
      console.warn('Could not load seed file blob:', e);
      setPreviewUrl(scenario.seedImg);
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);

    // Validation: Require either media file, audio, or a detailed note
    if (!selectedFile && !audioBlob && !citizenNote.trim()) {
      setErrorMessage('Please provide photo/video evidence, record a voice note, or describe the problem.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('media', selectedFile);
      }
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voicenote.webm');
      }
      formData.append('lat', coords.lat);
      formData.append('lng', coords.lng);
      formData.append('address', coords.address);
      formData.append('citizenNote', citizenNote);

      const res = await axios.post('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.complaint) {
        setResultComplaint(res.data.complaint);
      } else {
        throw new Error(res.data?.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMessage(err.response?.data?.error || err.message || 'Error communicating with triage server');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    handleFileRemove();
    handleAudioClear();
    setCitizenNote('');
    setResultComplaint(null);
    setCurrentStep(1);
    setErrorMessage(null);
  };

  if (resultComplaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <TriageResultCard complaint={resultComplaint} onReportAnother={resetForm} />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <SubmissionProgress />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title & Description */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>3-Tap Mobile Grievance Flow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy">{t('report.title')}</h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">{t('report.subtitle')}</p>
      </div>

      {/* Demo Mode Preset Pill */}
      <DemoModeButton onApplyDemoSample={applyDemoScenario} />

      {/* Step Tabs Indicator */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-2.5 rounded-xl border text-center transition-all ${
          selectedFile || audioBlob ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tap 1</p>
          <p className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Media Evidence</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-900 font-bold text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tap 2</p>
          <p className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Location Pin</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl border bg-amber-50 border-amber-300 text-amber-900 font-bold text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tap 3</p>
          <p className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Triage</span>
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="civic-card p-5 sm:p-7 space-y-8">
        
        {/* Step 1: Media Evidence */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-extrabold text-civic-navy flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-civic-navy text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span>{t('report.step1_title')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('report.step1_desc')}</p>
          </div>

          <MediaUploadStep
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            citizenNote={citizenNote}
            onNoteChange={setCitizenNote}
            audioBlob={audioBlob}
            onAudioRecorded={handleAudioRecorded}
            onAudioClear={handleAudioClear}
          />
        </div>

        {/* Step 2: Location */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-extrabold text-civic-navy flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-civic-navy text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span>{t('report.step2_title')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('report.step2_desc')}</p>
          </div>

          <LocationPickerStep
            coords={coords}
            onLocationChange={updateLocation}
            onDetectLocation={detectLocation}
            loading={geoLoading}
            geoError={geoError}
          />
        </div>

        {/* Step 3: Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full civic-tap-target py-4 px-6 rounded-2xl bg-civic-gold hover:bg-amber-400 text-civic-navy font-black text-base shadow-elevated transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5"
          >
            <Send className="w-5 h-5 text-civic-navy" />
            <span>{t('report.submit_btn')}</span>
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            Instant AI triage analysis, deterministic scoring & transparent routing will execute immediately upon submit.
          </p>
        </div>

      </form>

    </div>
  );
}
