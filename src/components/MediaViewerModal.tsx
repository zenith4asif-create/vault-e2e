import React, { useState, useRef } from 'react';
import { VaultItem } from '../types/vault';
import { formatBytes } from '../services/cloudinary';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Phone,
  Mail,
  Maximize2
} from 'lucide-react';
import { playLiquidClick } from '../services/audio';

interface MediaViewerModalProps {
  isOpen: boolean;
  item: VaultItem | null;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  item,
  onClose,
  onToast
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen || !item) return null;

  const handleCopy = async (text?: string, label = 'Link') => {
    if (!text) return;
    playLiquidClick();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onToast(`Copied ${label} to clipboard`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Failed to copy', 'error');
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              {item.service || item.fileName || 'Encrypted Media Asset'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className="capitalize">{item.category}</span>
              {item.fileSize && (
                <>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="font-mono">{formatBytes(item.fileSize)}</span>
                </>
              )}
              {item.fileType && (
                <>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="font-mono uppercase">{item.fileType}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.fileUrl && (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={item.fileName || 'vault-asset'}
                className="p-2 rounded-xl liquid-btn-ghost text-neutral-300 hover:text-white"
                title="Download / Open source"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => {
                playLiquidClick();
                onClose();
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          {/* IMAGE VIEWER */}
          {item.category === 'image' && item.fileUrl && (
            <div className="relative w-full flex items-center justify-center max-h-[60vh] overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-2">
              <img
                src={item.fileUrl}
                alt={item.service || 'Vault encrypted image'}
                className="max-h-[56vh] w-auto max-w-full object-contain rounded-xl select-none"
              />
            </div>
          )}

          {/* VIDEO VIEWER */}
          {item.category === 'video' && item.fileUrl && (
            <div className="w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-inner">
              <video
                src={item.fileUrl}
                controls
                autoPlay
                className="w-full max-h-[58vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* AUDIO PLAYER */}
          {item.category === 'audio' && item.fileUrl && (
            <div className="w-full max-w-md p-6 rounded-2xl liquid-glass border border-white/15 my-6 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner relative group">
                <div className={`absolute inset-0 rounded-2xl bg-white/10 blur-lg transition-opacity ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-20'}`} />
                <span className="text-2xl font-mono relative z-10">♬</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white truncate">{item.service || item.fileName}</h3>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">{formatBytes(item.fileSize)}</p>
              </div>

              <audio
                ref={audioRef}
                src={item.fileUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
            </div>
          )}

          {/* DOCUMENT / RAW FILE */}
          {item.category === 'file' && (
            <div className="w-full max-w-md p-7 rounded-2xl liquid-glass border border-white/15 my-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center">
                <FileText className="w-8 h-8 text-neutral-300" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white break-all">{item.fileName || item.service}</h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  {formatBytes(item.fileSize)} · {item.fileType || 'Document Asset'}
                </p>
              </div>

              {item.fileUrl && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-semibold liquid-btn-primary flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open / Download</span>
                  </a>
                  <button
                    onClick={() => handleCopy(item.fileUrl, 'File URL')}
                    className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>Copy URL</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LINK / BOOKMARK */}
          {item.category === 'link' && (
            <div className="w-full max-w-lg p-6 rounded-2xl liquid-glass border border-white/15 my-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white truncate">{item.service}</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-300 hover:text-white underline underline-offset-2 truncate block mt-0.5 font-mono"
                  >
                    {item.url}
                  </a>
                </div>
              </div>

              {item.notes && (
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.04] text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {item.notes}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => handleCopy(item.url, 'Link')}
                  className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Link</span>
                </button>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl text-xs font-semibold liquid-btn-primary flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Link</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CONTACT / PHONE NUMBER */}
          {item.category === 'contact' && (
            <div className="w-full max-w-md p-6 rounded-2xl liquid-glass border border-white/15 my-4 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner text-xl font-bold text-white">
                  {item.service ? item.service.charAt(0).toUpperCase() : 'C'}
                </div>
                <h3 className="text-lg font-bold text-white">{item.service}</h3>
                {item.phoneNumber && (
                  <p className="font-mono text-base text-neutral-200 mt-1">{item.phoneNumber}</p>
                )}
                {item.email && (
                  <p className="text-xs text-neutral-400 mt-0.5">{item.email}</p>
                )}
              </div>

              {item.notes && (
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {item.notes}
                </div>
              )}

              <div className="flex items-center justify-center gap-2.5 pt-2">
                {item.phoneNumber && (
                  <a
                    href={`tel:${item.phoneNumber}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold liquid-btn-primary flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
                <button
                  onClick={() => handleCopy(item.phoneNumber || item.email, 'Contact info')}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes summary if any */}
          {item.notes && item.category !== 'link' && item.category !== 'contact' && (
            <div className="w-full mt-4 p-3.5 rounded-xl bg-black/30 border border-white/[0.04] text-xs text-neutral-300 max-h-32 overflow-y-auto leading-relaxed">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                Decrypted Note
              </span>
              {item.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
