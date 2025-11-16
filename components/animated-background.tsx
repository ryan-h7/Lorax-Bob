'use client';

import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  opacity?: number;
  blur?: number;
}

export function AnimatedBackground({ opacity = 30, blur = 5 }: AnimatedBackgroundProps) {
  const [debugTime, setDebugTime] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay(debugTime));

  useEffect(() => {
    // Update time of day every minute (or immediately if debug time changes)
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay(debugTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [debugTime]);

  // Update immediately when debug time changes
  useEffect(() => {
    setTimeOfDay(getTimeOfDay(debugTime));
  }, [debugTime]);

  return (
    <>
      {/* Debug Time Slider */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 bg-black/50 text-white rounded-md text-sm hover:bg-black/70 transition-colors pointer-events-auto"
        >
          {showDebug ? '✕' : '🕐'} Debug Time
        </button>
        {showDebug && (
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap">
                {debugTime !== null ? `${Math.floor(debugTime)}:${String(Math.round((debugTime % 1) * 60)).padStart(2, '0')}` : 'Real Time'}
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.25"
                value={debugTime ?? new Date().getHours() + new Date().getMinutes() / 60}
                onChange={(e) => setDebugTime(parseFloat(e.target.value))}
                className="w-48 accent-blue-500"
              />
              <button
                onClick={() => setDebugTime(null)}
                className="px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-1000 overflow-hidden"
        style={{
          opacity: opacity / 100,
          filter: `blur(${blur}px)`
        }}
      >
        {/* Sky gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-[2000ms]"
        style={{ background: timeOfDay.skyGradient }}
      />

      {/* Sun/Moon */}
      <div
        className="absolute rounded-full transition-all duration-[2000ms] shadow-2xl"
        style={{
          width: '120px',
          height: '120px',
          background: timeOfDay.sunColor,
          boxShadow: `0 0 60px 30px ${timeOfDay.sunGlow}`,
          left: timeOfDay.sunLeft,
          top: timeOfDay.sunTop,
          transform: 'translate(-50%, -50%)',
          opacity: timeOfDay.sunVisible ? 1 : 0,
        }}
      />

      {/* Moon (separate object) */}
      <div
        className="absolute rounded-full transition-all duration-[2000ms] shadow-2xl"
        style={{
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #d0d0d0)',
          boxShadow: `0 0 40px 20px rgba(220, 220, 255, 0.4), inset -10px -10px 20px rgba(0, 0, 0, 0.2)`,
          left: timeOfDay.moonLeft,
          top: timeOfDay.moonTop,
          transform: 'translate(-50%, -50%)',
          opacity: timeOfDay.moonVisible ? 1 : 0,
        }}
      >
        {/* Moon craters for detail */}
        <div className="absolute w-3 h-3 rounded-full bg-gray-400/30 top-1/4 left-1/3" />
        <div className="absolute w-2 h-2 rounded-full bg-gray-400/20 top-1/2 right-1/4" />
        <div className="absolute w-4 h-4 rounded-full bg-gray-400/25 bottom-1/4 left-1/2" />
      </div>

      {/* Stars (only visible at night) */}
      {timeOfDay.showStars && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => {
            const size = Math.random() * 3 + 1;
            const twinkleDelay = Math.random() * 5;
            const twinkleDuration = Math.random() * 3 + 2;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: size + 'px',
                  height: size + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 60 + '%',
                  animation: `twinkle ${twinkleDuration}s ease-in-out ${twinkleDelay}s infinite`,
                  boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
                }}
              />
            );
          })}
          <style jsx>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.2); }
            }
          `}</style>
        </div>
      )}

      {/* Mountains - layered for depth */}
      <svg 
        className="absolute bottom-0 w-full transition-all duration-[2000ms]" 
        viewBox="0 0 1200 400" 
        preserveAspectRatio="none"
        style={{ height: '50%' }}
      >
        {/* Back mountains */}
        <path
          d="M0,300 L200,150 L400,250 L600,100 L800,200 L1000,120 L1200,280 L1200,400 L0,400 Z"
          className="transition-all duration-[2000ms]"
          style={{ fill: timeOfDay.mountainBack }}
        />
        
        {/* Middle mountains */}
        <path
          d="M0,350 L150,200 L350,280 L500,150 L700,250 L900,180 L1100,300 L1200,350 L1200,400 L0,400 Z"
          className="transition-all duration-[2000ms]"
          style={{ fill: timeOfDay.mountainMiddle }}
        />
        
        {/* Front mountains */}
        <path
          d="M0,380 L100,250 L300,320 L450,220 L650,300 L850,240 L1050,340 L1200,380 L1200,400 L0,400 Z"
          className="transition-all duration-[2000ms]"
          style={{ fill: timeOfDay.mountainFront }}
        />
      </svg>
      </div>
    </>
  );
}

// Helper function to determine time of day and corresponding colors
function getTimeOfDay(debugTime: number | null = null) {
  const timeDecimal = debugTime ?? (new Date().getHours() + new Date().getMinutes() / 60);

  // Calculate sun/moon position based on time (creates an arc across the sky)
  // Sunrise at ~6am (left), peak at noon (center top), sunset at ~6pm (right)
  const getSunPosition = (time: number) => {
    // Day: sun arc (5am to 9pm)
    const dayStart = 5;
    const dayEnd = 21;
    const dayProgress = (time - dayStart) / (dayEnd - dayStart); // 0 to 1 from dawn to dusk
    
    // Horizontal position: left to right
    const left = 5 + dayProgress * 90; // 5% to 95%
    
    // Vertical position: creates parabolic arc (sunrise low, noon high, sunset low)
    const arcHeight = Math.sin(dayProgress * Math.PI); // 0 at start/end, 1 at middle
    const top = 70 - arcHeight * 50; // 70% (low) to 20% (high) to 70% (low)
    
    return {
      left: `${left}%`,
      top: `${top}%`
    };
  };

  const getMoonPosition = (time: number) => {
    // Night: moon arc (9pm to 5am next day)
    // Convert to continuous range: 21-24 and 0-5 becomes 0-8
    const nightTime = time >= 21 ? time - 21 : time + 3; // 0-8 range for night
    const nightProgress = nightTime / 8; // 0 to 1 across the night
    
    // Horizontal position: left to right
    const left = 10 + nightProgress * 80; // 10% to 90%
    
    // Vertical position: gentle arc
    const arcHeight = Math.sin(nightProgress * Math.PI);
    const top = 50 - arcHeight * 20; // 50% to 30% to 50%
    
    return {
      left: `${left}%`,
      top: `${top}%`
    };
  };

  const sunPos = getSunPosition(timeDecimal);
  const moonPos = getMoonPosition(timeDecimal);
  
  // Determine visibility: sun during day (5-21), moon during night (21-5)
  const isSunVisible = timeDecimal >= 5 && timeDecimal < 21;
  const isMoonVisible = timeDecimal >= 21 || timeDecimal < 5;

  // Night: 0-5 (midnight to early morning)
  if (timeDecimal >= 0 && timeDecimal < 5) {
    return {
      skyGradient: 'linear-gradient(to bottom, #0a1128 0%, #1a1f3a 50%, #2d3250 100%)',
      sunColor: '#FFD700',
      sunGlow: 'rgba(255, 215, 0, 0.3)',
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: '#1a1f3a',
      mountainMiddle: '#242938',
      mountainFront: '#2d3250',
      showStars: true,
    };
  }
  
  // Dawn: 5-7 (sunrise)
  if (timeDecimal >= 5 && timeDecimal < 7) {
    const progress = (timeDecimal - 5) / 2;
    return {
      skyGradient: `linear-gradient(to bottom, 
        ${interpolateColor('#0a1128', '#FF6B9D', progress)} 0%, 
        ${interpolateColor('#1a1f3a', '#FFA07A', progress)} 40%, 
        ${interpolateColor('#2d3250', '#FFD700', progress)} 100%)`,
      sunColor: `${interpolateColor('#E8E8E8', '#FFD700', progress)}`,
      sunGlow: `${interpolateColor('rgba(232, 232, 232, 0.3)', 'rgba(255, 215, 0, 0.6)', progress)}`,
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: interpolateColor('#1a1f3a', '#8B4789', progress),
      mountainMiddle: interpolateColor('#242938', '#B565A7', progress),
      mountainFront: interpolateColor('#2d3250', '#D8A7CA', progress),
      showStars: progress < 0.5,
    };
  }

  // Morning: 7-12 (golden morning)
  if (timeDecimal >= 7 && timeDecimal < 12) {
    const progress = (timeDecimal - 7) / 5;
    return {
      skyGradient: `linear-gradient(to bottom, 
        ${interpolateColor('#FF6B9D', '#87CEEB', progress)} 0%, 
        ${interpolateColor('#FFA07A', '#B0E0E6', progress)} 50%, 
        ${interpolateColor('#FFD700', '#E0F6FF', progress)} 100%)`,
      sunColor: `${interpolateColor('#FFD700', '#FFE87C', progress)}`,
      sunGlow: `${interpolateColor('rgba(255, 215, 0, 0.6)', 'rgba(255, 232, 124, 0.5)', progress)}`,
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: interpolateColor('#8B4789', '#4A5899', progress),
      mountainMiddle: interpolateColor('#B565A7', '#6B7FB8', progress),
      mountainFront: interpolateColor('#D8A7CA', '#8FA6C7', progress),
      showStars: false,
    };
  }

  // Afternoon: 12-17 (bright day)
  if (timeDecimal >= 12 && timeDecimal < 17) {
    return {
      skyGradient: 'linear-gradient(to bottom, #4A90E2 0%, #87CEEB 40%, #E0F6FF 100%)',
      sunColor: '#FFE87C',
      sunGlow: 'rgba(255, 232, 124, 0.5)',
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: '#2F5F8F',
      mountainMiddle: '#4A7BA7',
      mountainFront: '#6B97BF',
      showStars: false,
    };
  }

  // Evening/Golden hour: 17-19 (sunset)
  if (timeDecimal >= 17 && timeDecimal < 19) {
    const progress = (timeDecimal - 17) / 2;
    return {
      skyGradient: `linear-gradient(to bottom, 
        ${interpolateColor('#4A90E2', '#FF6B6B', progress)} 0%, 
        ${interpolateColor('#87CEEB', '#FF8C42', progress)} 40%, 
        ${interpolateColor('#E0F6FF', '#FFD93D', progress)} 100%)`,
      sunColor: `${interpolateColor('#FFE87C', '#FF6347', progress)}`,
      sunGlow: `${interpolateColor('rgba(255, 232, 124, 0.5)', 'rgba(255, 99, 71, 0.7)', progress)}`,
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: interpolateColor('#2F5F8F', '#6B4C7A', progress),
      mountainMiddle: interpolateColor('#4A7BA7', '#8B6B9D', progress),
      mountainFront: interpolateColor('#6B97BF', '#AB8AC0', progress),
      showStars: false,
    };
  }

  // Dusk: 19-21 (twilight)
  if (timeDecimal >= 19 && timeDecimal < 21) {
    const progress = (timeDecimal - 19) / 2;
    return {
      skyGradient: `linear-gradient(to bottom, 
        ${interpolateColor('#FF6B6B', '#2C1E4F', progress)} 0%, 
        ${interpolateColor('#FF8C42', '#3D2E5F', progress)} 50%, 
        ${interpolateColor('#FFD93D', '#4E3D6F', progress)} 100%)`,
      sunColor: `${interpolateColor('#FF6347', '#E8E8E8', progress)}`,
      sunGlow: `${interpolateColor('rgba(255, 99, 71, 0.7)', 'rgba(232, 232, 232, 0.4)', progress)}`,
      sunLeft: sunPos.left,
      sunTop: sunPos.top,
      sunVisible: isSunVisible,
      moonLeft: moonPos.left,
      moonTop: moonPos.top,
      moonVisible: isMoonVisible,
      mountainBack: interpolateColor('#6B4C7A', '#1a1f3a', progress),
      mountainMiddle: interpolateColor('#8B6B9D', '#242938', progress),
      mountainFront: interpolateColor('#AB8AC0', '#2d3250', progress),
      showStars: progress > 0.5,
    };
  }

  // Night: 21-24
  return {
    skyGradient: 'linear-gradient(to bottom, #0a1128 0%, #1a1f3a 50%, #2d3250 100%)',
    sunColor: '#FFD700',
    sunGlow: 'rgba(255, 215, 0, 0.3)',
    sunLeft: sunPos.left,
    sunTop: sunPos.top,
    sunVisible: isSunVisible,
    moonLeft: moonPos.left,
    moonTop: moonPos.top,
    moonVisible: isMoonVisible,
    mountainBack: '#1a1f3a',
    mountainMiddle: '#242938',
    mountainFront: '#2d3250',
    showStars: true,
  };
}

// Helper to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
