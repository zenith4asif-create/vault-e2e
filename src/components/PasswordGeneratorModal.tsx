import React, { useState } from 'react';
import { X, RefreshCw, Copy, Check, Sliders, Shield } from 'lucide-react';
import { generatePassword, evaluatePasswordStrength } from '../services/crypto';
import { playLiquidClick } from '../services/audio';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => generatePassword(24));
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleRegenerate = () => {
    playLiquidClick();
    const next = generatePassword(length, { uppercase, lowercase, numbers, symbols });
    setPassword(next);
  };

  const handleCopy = async () => {
    playLiquidClick();
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      onToast('Password copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Failed to copy', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md p-6 rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Cryptographic Key Generator
            </h2>
          </div>
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generated Password Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/15 mb-4 relative flex items-center justify-between gap-3 shadow-inner">
          <span className="font-mono text-sm sm:text-base text-white tracking-wider break-all select-all">
            {password}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleRegenerate}
              title="Regenerate"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="mb-5 space-y-1">
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden border border-white/10 p-[0.5px]">
            <div
              className="h-full bg-gradient-to-r from-white/40 to-white rounded-full transition-all duration-300"
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Cryptographic Entropy</span>
            <span className="text-white font-medium">{strength.label} ({Math.round(strength.percent)}%)</span>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4 pt-2 border-t border-white/[0.06]">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span>Length</span>
              </span>
              <span className="font-mono font-bold text-white tabular-nums">{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLength(val);
                setPassword(generatePassword(val, { uppercase, lowercase, numbers, symbols }));
              }}
              className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => {
                  setUppercase(e.target.checked);
                  setPassword(generatePassword(length, { uppercase: e.target.checked, lowercase, numbers, symbols }));
                }}
                className="accent-white rounded"
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => {
                  setLowercase(e.target.checked);
                  setPassword(generatePassword(length, { uppercase, lowercase: e.target.checked, numbers, symbols }));
                }}
                className="accent-white rounded"
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => {
                  setNumbers(e.target.checked);
                  setPassword(generatePassword(length, { uppercase, lowercase, numbers: e.target.checked, symbols }));
                }}
                className="accent-white rounded"
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => {
                  setSymbols(e.target.checked);
                  setPassword(generatePassword(length, { uppercase, lowercase, numbers, symbols: e.target.checked }));
                }}
                className="accent-white rounded"
              />
              <span>Symbols (!@#$%)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-white/[0.08]">
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-5 py-2 rounded-xl text-xs font-semibold liquid-btn-primary cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy & Use</span>
          </button>
        </div>
      </div>
    </div>
  );
};
