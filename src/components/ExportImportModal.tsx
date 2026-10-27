import React, { useState } from 'react';
import { VaultItem, VaultBlob } from '../types/vault';
import { X, Download, Upload, Shield, AlertTriangle, FileJson, Check } from 'lucide-react';
import { playLiquidClick } from '../services/audio';

interface ExportImportModalProps {
  isOpen: boolean;
  items: VaultItem[];
  vaultBlob: VaultBlob | null;
  onClose: () => void;
  onImportItems: (newItems: VaultItem[]) => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  items,
  vaultBlob,
  onClose,
  onImportItems,
  onToast
}) => {
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleExportEncrypted = () => {
    playLiquidClick();
    if (!vaultBlob) {
      onToast('No encrypted blob available to export', 'error');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vaultBlob, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vault-encrypted-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('Encrypted vault exported safely', 'success');
  };

  const handleExportDecrypted = () => {
    playLiquidClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ items, exportedAt: Date.now() }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vault-plaintext-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('Plaintext JSON backup exported', 'warn');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed.items)) {
          await onImportItems(parsed.items);
          onToast(`Successfully imported ${parsed.items.length} items`, 'success');
          onClose();
        } else {
          onToast('Invalid vault format. Expected { items: [...] }', 'error');
        }
      } catch (err) {
        onToast('Failed to parse import file', 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md p-6 sm:p-7 rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Vault Data Portability
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

        <div className="space-y-4">
          {/* Encrypted Backup Option */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white">Encrypted Blob Backup</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Safely encrypted with your master password (AES-256-GCM). Safe to store anywhere.
                </p>
                <button
                  onClick={handleExportEncrypted}
                  className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Encrypted .json</span>
                </button>
              </div>
            </div>
          </div>

          {/* Plaintext Backup Option */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white">Plaintext JSON Export</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Unencrypted human-readable file containing all passwords and notes. Store privately!
                </p>
                <button
                  onClick={handleExportDecrypted}
                  className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-medium liquid-btn-ghost hover:border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Export Plain JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-white">Import Entries</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Merge records from a previously exported plaintext JSON file.
                </p>
                <label className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium liquid-btn-ghost cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importing ? 'Importing…' : 'Select .json file'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
