import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowRight, LogOut, KeyRound } from 'lucide-react';
import { playLiquidClick } from '../services/audio';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export const LiquidLoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playLiquidClick();
    onLogin(email.trim(), password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md mx-auto">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center text-white shadow-2xl backdrop-blur-2xl relative group">
            <div className="absolute inset-0 rounded-2xl bg-white/[0.08] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <Shield className="w-7 h-7 text-white relative z-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Vault
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 font-medium">
            Zero-Knowledge Encrypted Personal Data Storage
          </p>
        </div>

        {/* Liquid Glass Login Container */}
        <div className="p-7 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/15 text-neutral-100 shadow-2xl relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Authenticate your identity to fetch your encrypted vault envelope.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    playLiquidClick();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold liquid-btn-primary cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In & Establish Tunnel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer information & Developer Credit */}
          <div className="mt-7 pt-5 border-t border-white/[0.08] text-center space-y-2">
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              No public registration. Client-side authentication credentials only.
            </p>
            <p className="text-xs font-medium text-white/80">
              Developer: <span className="text-white font-semibold">Asif Ansari</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UnlockViewProps {
  userEmail: string;
  isCreateMode: boolean;
  onUnlock: (masterPassword: string, confirmPassword?: string) => Promise<void>;
  onSignOut: () => void;
  isLoading: boolean;
  error: string;
}

export const LiquidUnlockView: React.FC<UnlockViewProps> = ({
  userEmail,
  isCreateMode,
  onUnlock,
  onSignOut,
  isLoading,
  error
}) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playLiquidClick();
    onUnlock(masterPassword, confirmPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md mx-auto">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center text-white shadow-2xl backdrop-blur-2xl relative">
            <Lock className="w-7 h-7 text-white relative z-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            {isCreateMode ? 'Create Master Key' : 'Unlock Data Vault'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 font-mono truncate max-w-xs mx-auto">
            {userEmail}
          </p>
        </div>

        {/* Liquid Glass Unlock Container */}
        <div className="p-7 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/15 text-neutral-100 shadow-2xl relative">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white tracking-tight">
              {isCreateMode ? 'Initialize Master Password' : 'Enter Master Password'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isCreateMode
                ? 'Your master password derives the AES-256 key locally. There is no password recovery if lost.'
                : 'Your master password decrypts the encrypted payload in memory. It is never transmitted anywhere.'}
            </p>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoFocus
                  autoComplete="off"
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    playLiquidClick();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isCreateMode && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="off"
                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold liquid-btn-primary cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Deriving Key & Decrypting…</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isCreateMode ? 'Encrypt & Create Vault' : 'Decrypt & Access'}</span>
                </>
              )}
            </button>
          </form>

          {/* Action to switch account or sign out */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
            <span className="text-[11px] font-mono text-neutral-500">PBKDF2 600K · AES-GCM</span>
            <button
              onClick={() => {
                playLiquidClick();
                onSignOut();
              }}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
