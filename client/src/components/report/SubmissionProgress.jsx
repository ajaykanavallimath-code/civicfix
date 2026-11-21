import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Cpu } from 'lucide-react';

export default function SubmissionProgress() {
  const steps = [
    { title: 'Uploading Evidence', desc: 'Secure multipart transfer to local server' },
    { title: 'Gemini 2.5 Flash Triage', desc: 'Visual severity detection, safety risk assessment & language classification' },
    { title: 'Deterministic Priority Scoring', desc: 'Evaluating sensitive places (200m radius), duplicates & age formula' },
    { title: 'Jurisdiction & SLA Routing', desc: 'Matching accountable department (TMC, PWD, KUWS&DB, HESCOM, KSPCB)' }
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="civic-card p-6 sm:p-8 space-y-6 max-w-lg mx-auto text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-civic-navy flex items-center justify-center mx-auto shadow-soft animate-pulse">
        <Cpu className="w-8 h-8 text-civic-navy" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-civic-navy flex items-center justify-center gap-2">
          <span>Triaging Grievance in Real-Time</span>
          <Sparkles className="w-5 h-5 text-civic-gold animate-spin" />
        </h3>
        <p className="text-xs text-slate-500">CivicFix Radical Transparency Engine is analyzing your report</p>
      </div>

      {/* Vertical Steps */}
      <div className="space-y-3 text-left max-w-sm mx-auto">
        {steps.map((s, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          return (
            <div 
              key={idx}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                isCurrent 
                  ? 'bg-amber-50/70 border-amber-300 shadow-xs' 
                  : isDone 
                  ? 'bg-emerald-50/50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-civic-navy animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${isCurrent ? 'text-civic-navy' : isDone ? 'text-emerald-900' : 'text-slate-500'}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
