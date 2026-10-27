import React, { useState, useRef } from 'react';
import { VaultItem } from '../types/vault';
import { formatBytes } from '../services/cloudinary';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Key,
  Shield,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileUp,
  Link as LinkIcon,
  Phone,
  ExternalLink,
  Play,
  Download
} from 'lucide-react';
import { playLiquidClick } from '../services/audio';

interface LiquidCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onPreview: (item: VaultItem) => void;
  onToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  item,
  onEdit,
  onDelete,
  onPreview,
  onToast
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic liquid specular glare position
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  const copyToClipboard = async (text: string, fieldKey: string, label: string) => {
    playLiquidClick();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      onToast(`Copied ${label} to clipboard`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedField(fieldKey);
      onToast(`Copied ${label} to clipboard`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const categoryConfig: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    credential: { label: 'Credential', icon: Key },
    image: { label: 'Cloud Image', icon: ImageIcon },
    video: { label: 'Cloud Video', icon: Video },
    audio: { label: 'Cloud Audio', icon: Music },
    file: { label: 'Encrypted File', icon: FileUp },
    link: { label: 'Secure Bookmark', icon: LinkIcon },
    contact: { label: 'Directory Contact', icon: Phone },
    note: { label: 'Secure Text', icon: FileText },
    backup: { label: '2FA Backup', icon: Shield }
  };

  const config = categoryConfig[item.category] || { label: 'Item', icon: Key };
  const CategoryIcon = config.icon;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl p-5 transition-all duration-300 liquid-glass hover:border-white/20 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between"
    >
      {/* Interactive Liquid Specular Glare */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(400px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.08), transparent 60%)`
        }}
        aria-hidden="true"
      />

      {/* Top Header */}
      <div>
        <header className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Liquid icon badge */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 text-white/90 shadow-inner group-hover:border-white/20 transition-colors">
              <CategoryIcon className="w-4 h-4 text-white/80" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white tracking-tight truncate">
                {item.service || item.fileName || (item.category === 'note' ? 'Untitled Note' : 'Untitled Entry')}
              </h3>
              {/* Unboxed metadata without static pills */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span>{config.label}</span>
                {item.username && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="truncate max-w-[130px] text-neutral-400">{item.username}</span>
                  </>
                )}
                {item.fileSize && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="font-mono text-[11px] text-neutral-400">{formatBytes(item.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                playLiquidClick();
                onEdit(item);
              }}
              title="Edit item"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playLiquidClick();
                onDelete(item);
              }}
              title="Delete item"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Card Body by Category */}
        <div className="space-y-2.5 pt-1">
          {/* IMAGE CARD PREVIEW */}
          {item.category === 'image' && item.fileUrl && (
            <div
              onClick={() => onPreview(item)}
              className="relative w-full h-36 rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] cursor-pointer group/img"
            >
              <img
                src={item.fileUrl}
                alt={item.service}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-xs font-semibold text-white px-3 py-1 rounded-lg liquid-glass">
                  Click to Expand
                </span>
              </div>
            </div>
          )}

          {/* VIDEO CARD PREVIEW */}
          {item.category === 'video' && item.fileUrl && (
            <div
              onClick={() => onPreview(item)}
              className="relative w-full h-32 rounded-xl overflow-hidden bg-black/50 border border-white/[0.06] cursor-pointer flex items-center justify-center group/vid"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-transform group-hover/vid:scale-110 shadow-lg">
                <Play className="w-4 h-4 ml-0.5 fill-white text-white" />
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-neutral-300">
                {item.fileType?.toUpperCase() || 'VIDEO'}
              </div>
            </div>
          )}

          {/* AUDIO CARD PREVIEW */}
          {item.category === 'audio' && item.fileUrl && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => onPreview(item)}
                  title="Play audio"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer shrink-0 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-white text-white" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.fileName || 'Audio Track'}</p>
                  <p className="text-[11px] text-neutral-400 font-mono">{formatBytes(item.fileSize)}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(item.fileUrl || '', 'audioUrl', 'Audio URL')}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                title="Copy audio link"
              >
                {copiedField === 'audioUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* FILE / DOCUMENT CARD */}
          {item.category === 'file' && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{item.fileName || item.service}</p>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {formatBytes(item.fileSize)} · {item.fileType?.toUpperCase() || 'FILE'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.fileName || 'file'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onPreview(item)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="View details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* LINK / BOOKMARK CARD */}
          {item.category === 'link' && item.url && (
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04] flex items-center justify-between gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-200 hover:text-white truncate font-mono flex-1 underline-offset-2 hover:underline"
                title={item.url}
              >
                {item.url}
              </a>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(item.url || '', 'linkUrl', 'URL')}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white cursor-pointer"
                  title="Copy link"
                >
                  {copiedField === 'linkUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* CONTACT / PHONE NUMBER CARD */}
          {item.category === 'contact' && (
            <div className="space-y-1.5">
              {item.phoneNumber && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/20 border border-white/[0.04]">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500 pl-1 shrink-0">Phone</span>
                  <a
                    href={`tel:${item.phoneNumber}`}
                    className="font-mono text-xs text-neutral-200 truncate flex-1 text-right hover:text-white hover:underline"
                  >
                    {item.phoneNumber}
                  </a>
                  <button
                    onClick={() => copyToClipboard(item.phoneNumber || '', 'phone', 'Phone Number')}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white cursor-pointer shrink-0"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {item.email && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/20 border border-white/[0.04]">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500 pl-1 shrink-0">Email</span>
                  <a
                    href={`mailto:${item.email}`}
                    className="font-mono text-xs text-neutral-300 truncate flex-1 text-right hover:text-white"
                  >
                    {item.email}
                  </a>
                  <button
                    onClick={() => copyToClipboard(item.email || '', 'email', 'Email')}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white cursor-pointer shrink-0"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CREDENTIAL: USERNAME & PASSWORD */}
          {item.category === 'credential' && (
            <>
              {item.username && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/20 border border-white/[0.04]">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500 pl-1 shrink-0">User</span>
                  <span className="font-mono text-xs text-neutral-200 truncate flex-1 text-right select-all">
                    {item.username}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.username || '', 'user', 'Username')}
                    title="Copy username"
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === 'user' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {item.password && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/20 border border-white/[0.04]">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500 pl-1 shrink-0">Pass</span>
                  <span className="font-mono text-xs text-neutral-200 truncate flex-1 text-right select-all tracking-wider">
                    {showPassword ? item.password : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => {
                        playLiquidClick();
                        setShowPassword(!showPassword);
                      }}
                      title={showPassword ? 'Hide password' : 'Reveal password'}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.password || '', 'pwd', 'Password')}
                      title="Copy password"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {copiedField === 'pwd' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BACKUP CODES */}
          {item.category === 'backup' && item.backupCodes && (
            <div className="relative p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-500">Recovery Codes</span>
                <button
                  onClick={() => copyToClipboard(item.backupCodes || '', 'backup', 'Backup Codes')}
                  title="Copy all backup codes"
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedField === 'backup' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy all</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-neutral-300 whitespace-pre-wrap break-all max-h-24 overflow-y-auto leading-relaxed select-all">
                {item.backupCodes}
              </pre>
            </div>
          )}

          {/* NOTES DISPLAY */}
          {item.notes && item.category !== 'image' && (
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/[0.03] text-xs text-neutral-300 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
              {item.notes}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <footer className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
        <span>Updated {formatDate(item.updatedAt || item.createdAt)}</span>
        <span className="text-neutral-500">AES-256</span>
      </footer>
    </article>
  );
};
