import React from 'react';
import { VaultItem } from '../types/vault';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { playLiquidClick } from '../services/audio';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  item: VaultItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm p-6 rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Permanently Remove Item?
            </h2>
          </div>
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="p-1 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
          Are you sure you want to delete <strong className="text-white font-semibold">{item.service || 'this entry'}</strong>?
        </p>
        <p className="text-[11px] text-neutral-500 mb-5">
          This operation re-encrypts the vault without this item. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              playLiquidClick();
              onConfirm();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold liquid-btn-danger flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
