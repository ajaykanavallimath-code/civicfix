import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-civic-navy text-slate-300 py-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-civic-gold text-civic-navy font-black flex items-center justify-center text-sm font-bold">
              CF
            </div>
            <div>
              <p className="font-bold text-white text-sm">CivicFix</p>
              <p className="text-slate-400 text-[11px]">IDEA//FORGE Track 1: Civic Pulse | Problem 2</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Explainable AI Triage & Open Public Accountability for Karnataka Urban Local Bodies</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>OpenStreetMap</span>
            <span>•</span>
            <span>Savanur & Haveri District Pilot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
