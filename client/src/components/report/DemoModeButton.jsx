import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

export default function DemoModeButton({ onApplyDemoSample }) {
  const sampleScenarios = [
    {
      label: 'Pipe Burst @ Savanur CHC',
      type: 'water_leak',
      lat: 14.9688,
      lng: 75.3435,
      address: 'Near Savanur Community Health Centre, Hospital Road',
      note: 'High-pressure clean water gushing onto the road from broken municipal pipeline.',
      seedImg: '/seed/water-leak-1.svg',
      fileName: 'chc_water_burst.svg'
    },
    {
      label: 'Dangerous Crater @ Govt School',
      type: 'pothole',
      lat: 14.9702,
      lng: 75.3418,
      address: 'Opposite Savanur Govt Model Primary School, Court Road',
      note: 'Deep road depression causing student transport vans to scrape and stall.',
      seedImg: '/seed/pothole-1.svg',
      fileName: 'school_pothole.svg'
    },
    {
      label: 'Live Sparking Wire @ Bus Stand',
      type: 'streetlight',
      lat: 14.9695,
      lng: 75.3389,
      address: 'Near KSRTC Bus Stand Exit, Station Road, Savanur',
      note: 'Overhead pole wire snapping in wind; sparks showering down near fruit stalls.',
      seedImg: '/seed/streetlight-2.svg',
      fileName: 'live_wire_sparking.svg'
    }
  ];

  return (
    <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
          <Zap className="w-4 h-4 text-civic-gold fill-civic-gold" />
          <span>Demo Mode: Quick Sample Scenarios for Hackathon Presentation</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
          1-Tap Fill
        </span>
      </div>
      
      <p className="text-[11px] text-amber-800 leading-snug">
        Click any scenario to pre-fill photo, coordinates, and notes instantly:
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {sampleScenarios.map((scenario, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onApplyDemoSample(scenario)}
            className="civic-tap-target px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-950 text-xs font-bold border border-amber-300 shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-civic-gold" />
            <span>{scenario.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
