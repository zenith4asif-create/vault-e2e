import React from 'react';
import { Lock, LogOut, Volume2, VolumeX, Shield, KeyRound, Download, CheckCircle2 } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playLiquidClick } from '../services/audio';

interface LiquidNavbarProps {
  userEmail: string;
  onLock: () => void;
  onLogout: () => void;
  onOpenGenerator: () => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  activeNavTab: 'vault' | 'generator' | 'audit' | 'export';
  setActiveNavTab: (tab: 'vault' | 'generator' | 'audit' | 'export') => void;
  onToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  userEmail,
  onLock,
  onLogout,
  onOpenGenerator,
  onOpenAudit,
  onOpenExport,
  activeNavTab,
  setActiveNavTab,
  onToast
}) => {
  const [sound, setSound] = React.useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playLiquidClick();
    onToast(next ? 'Sound and voice enabled' : 'Sound muted', 'success');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050608]/75 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element, one line) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white shadow-inner">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Vault
          </span>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean hover underlines/segmented highlights) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => {
              playLiquidClick();
              setActiveNavTab('vault');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              activeNavTab === 'vault'
                ? 'text-white border-b-2 border-white font-semibold'
                : 'hover:text-white'
            }`}
          >
            Vault Entries
          </button>

          <button
            onClick={() => {
              playLiquidClick();
              onOpenGenerator();
            }}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer py-1"
          >
            <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
            <span>Key Generator</span>
          </button>

          <button
            onClick={() => {
              playLiquidClick();
              onOpenAudit();
            }}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer py-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Health Audit</span>
          </button>

          <button
            onClick={() => {
              playLiquidClick();
              onOpenExport();
            }}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors cursor-pointer py-1"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Data Portability</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary action set (Lock & Sound toggle & Sign out) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sound narration mute toggle */}
          <button
            onClick={toggleSound}
            title={sound ? 'Mute audio' : 'Enable audio'}
            className="p-2 rounded-xl liquid-btn-ghost cursor-pointer text-neutral-400 hover:text-white"
          >
            {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* User email badge */}
          <span className="hidden lg:inline-block font-mono text-xs text-neutral-400 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] truncate max-w-[170px]">
            {userEmail}
          </span>

          {/* Lock Vault button */}
          <button
            onClick={() => {
              playLiquidClick();
              onLock();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl liquid-btn-primary cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Lock</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              playLiquidClick();
              onLogout();
            }}
            title="Sign out"
            className="p-2 rounded-xl liquid-btn-ghost cursor-pointer text-neutral-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
