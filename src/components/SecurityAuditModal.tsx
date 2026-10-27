import React from 'react';
import { VaultItem } from '../types/vault';
import { X, AlertTriangle, CheckCircle, ShieldAlert, Key, Edit3 } from 'lucide-react';
import { evaluatePasswordStrength } from '../services/crypto';
import { playLiquidClick } from '../services/audio';

interface SecurityAuditModalProps {
  isOpen: boolean;
  items: VaultItem[];
  onClose: () => void;
  onEditItem: (item: VaultItem) => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  items,
  onClose,
  onEditItem
}) => {
  if (!isOpen) return null;

  const credentials = items.filter(i => (i.category || 'credential') === 'credential' && i.password);

  // Group passwords to detect reused ones
  const passwordMap = new Map<string, VaultItem[]>();
  credentials.forEach(item => {
    if (!item.password) return;
    const list = passwordMap.get(item.password) || [];
    list.push(item);
    passwordMap.set(item.password, list);
  });

  const reusedItems: Array<{ item: VaultItem; count: number }> = [];
  passwordMap.forEach((list) => {
    if (list.length > 1) {
      list.forEach(i => reusedItems.push({ item: i, count: list.length }));
    }
  });

  // Weak items
  const weakItems = credentials.filter(i => {
    const s = evaluatePasswordStrength(i.password || '');
    return s.score <= 2;
  });

  const healthyItemsCount = credentials.length - new Set([...reusedItems.map(r => r.item.id), ...weakItems.map(w => w.id)]).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg p-6 sm:p-7 rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Vault Security Health Audit
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

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
              Secure
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {Math.max(0, healthyItemsCount)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
              Weak Keys
            </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${weakItems.length > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
              {weakItems.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
              Reused
            </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${reusedItems.length > 0 ? 'text-red-400' : 'text-neutral-400'}`}>
              {reusedItems.length}
            </span>
          </div>
        </div>

        {/* Audit Findings List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {weakItems.length === 0 && reusedItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-white">All Passwords In Prime Health</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                No reused or weak credentials detected among your encrypted records.
              </p>
            </div>
          ) : (
            <>
              {weakItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Low Entropy Passwords ({weakItems.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {weakItems.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.service}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{item.username || 'No username'}</p>
                        </div>
                        <button
                          onClick={() => {
                            playLiquidClick();
                            onClose();
                            onEditItem(item);
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg liquid-btn-ghost flex items-center gap-1 shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Strengthen</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reusedItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400/90 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Duplicate / Shared Passwords ({reusedItems.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {reusedItems.map(({ item, count }) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.service}</p>
                          <p className="text-[11px] text-red-300/80">Reused across {count} accounts</p>
                        </div>
                        <button
                          onClick={() => {
                            playLiquidClick();
                            onClose();
                            onEditItem(item);
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg liquid-btn-ghost flex items-center gap-1 shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Update</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-4 mt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold liquid-btn-primary cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
