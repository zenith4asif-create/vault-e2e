import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface ScifiLiquidDecryptPortalProps {
  mode: 'login' | 'unlock';
  title?: string;
  subtitle?: string;
  onComplete: () => void;
}

export const ScifiLiquidDecryptPortal: React.FC<ScifiLiquidDecryptPortalProps> = ({
  mode,
  title,
  subtitle,
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const defaultTitle = mode === 'login' ? 'ENTERING SECURE VAULT' : 'DECRYPTING LOCAL DATA';
  const defaultSubtitle = mode === 'login'
    ? 'Establishing End-to-End Encrypted Tunnel...'
    : 'Deriving PBKDF2-HMAC-SHA256 & Authenticating AES-256-GCM...';

  const logSequence = mode === 'login'
    ? [
        'Connecting to zero-knowledge vault gateway...',
        'Authenticating credential signatures...',
        'Deriving ephemeral session envelope...',
        'Syncing client-side ciphertext blocks...',
        'Secure communication established.'
      ]
    : [
        'Deriving key with PBKDF2 (600,000 SHA-256 iterations)...',
        'Extracting cryptographic 16-byte salt & 12-byte IV...',
        'Authenticating AES-256-GCM tag integrity...',
        'Decryption verified. Zero plain-text leakage...',
        'Local vault unlocked.'
      ];

  // Canvas matrix effect in colorless monochrome liquid style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const chars = '0123456789ABCDEF01010101#@$%&*<>[]{}';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const render = () => {
      // Clear with colorless translucent black
      ctx.fillStyle = 'rgba(5, 6, 8, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // Monochromatic silver / liquid glass matrix rain
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Specular head drop is brighter white, trailing is soft silver
        const isHead = Math.random() > 0.85;
        ctx.fillStyle = isHead ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.18)';
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Progression timer
  useEffect(() => {
    const stepDuration = mode === 'login' ? 400 : 350;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.round((currentStep / logSequence.length) * 100));
      setProgress(nextProgress);

      if (currentStep <= logSequence.length) {
        const logItem = logSequence[currentStep - 1];
        setCurrentLog(logItem);
        setLogs(prev => [...prev.slice(-3), logItem]);
      }

      if (currentStep >= logSequence.length + 1) {
        clearInterval(interval);
        setTimeout(onComplete, 200);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [mode, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050608]/90 backdrop-blur-2xl">
      {/* Liquid Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Center Liquid Glass Decryption Hud */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl liquid-glass-elevated border border-white/20 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Holographic Liquid Ring */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-25" />
          <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white/80 animate-spin" />
          <div className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            {mode === 'login' ? (
              <Cpu className="w-6 h-6 text-white" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-wider text-white uppercase font-sans mb-1.5">
          {title || defaultTitle}
        </h2>
        <p className="text-xs text-neutral-400 font-normal mb-6">
          {subtitle || defaultSubtitle}
        </p>

        {/* Liquid Progress Bar */}
        <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden border border-white/10 mb-4 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-white/40 via-white to-white/60 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-4">
          <span>PROGRESS</span>
          <span className="tabular-nums font-semibold text-white">{progress}%</span>
        </div>

        {/* Console Logs */}
        <div className="bg-black/40 rounded-xl p-3 border border-white/[0.06] text-left font-mono text-[11px] min-h-[72px] flex flex-col justify-end space-y-1">
          {logs.map((log, idx) => (
            <div key={idx} className="text-neutral-400 truncate flex items-center gap-1.5">
              <span className="text-neutral-600">›</span>
              <span className={idx === logs.length - 1 ? 'text-white font-medium' : 'text-neutral-500'}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Skip button for instant usability */}
        <button
          onClick={onComplete}
          className="mt-5 text-[11px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          [ Click to Skip ]
        </button>
      </div>
    </div>
  );
};
