import React, { useState, useEffect, useRef } from 'react';
import { VaultItem, VaultCategory } from '../types/vault';
import {
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Shield,
  FileText,
  Check,
  Image as ImageIcon,
  Video,
  Music,
  FileUp,
  Link as LinkIcon,
  Phone,
  Upload,
  AlertCircle
} from 'lucide-react';
import { generatePassword, evaluatePasswordStrength } from '../services/crypto';
import { uploadToCloudinary, formatBytes } from '../services/cloudinary';
import { playLiquidClick } from '../services/audio';

interface ItemModalProps {
  isOpen: boolean;
  item: VaultItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, item, onClose, onSave }) => {
  const [category, setCategory] = useState<VaultCategory>('credential');
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState('');
  const [notes, setNotes] = useState('');
  
  // New category fields
  const [url, setUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Cloudinary media fields
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [fileType, setFileType] = useState('');
  const [publicId, setPublicId] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (item) {
      setCategory(item.category || 'credential');
      setService(item.service || '');
      setUsername(item.username || '');
      setPassword(item.password || '');
      setBackupCodes(item.backupCodes || '');
      setNotes(item.notes || '');
      setUrl(item.url || '');
      setPhoneNumber(item.phoneNumber || '');
      setEmail(item.email || '');
      setFileUrl(item.fileUrl || '');
      setFileName(item.fileName || '');
      setFileSize(item.fileSize);
      setFileType(item.fileType || '');
      setPublicId(item.publicId || '');
    } else {
      setCategory('credential');
      setService('');
      setUsername('');
      setPassword('');
      setBackupCodes('');
      setNotes('');
      setUrl('');
      setPhoneNumber('');
      setEmail('');
      setFileUrl('');
      setFileName('');
      setFileSize(undefined);
      setFileType('');
      setPublicId('');
    }
    setError('');
    setUploadError('');
    setIsUploading(false);
    setUploadProgress(0);
    setShowPassword(false);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleGenerate = () => {
    playLiquidClick();
    const generated = generatePassword(20);
    setPassword(generated);
    setShowPassword(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      const result = await uploadToCloudinary(file, (percent) => {
        setUploadProgress(percent);
      });

      setFileUrl(result.secureUrl);
      setFileName(file.name);
      setFileSize(result.bytes);
      setFileType(result.format || file.type);
      setPublicId(result.publicId);

      // Auto-fill title if empty
      if (!service.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setService(cleanName);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Cloudinary upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category !== 'note' && !service.trim() && !fileName.trim()) {
      setError('Please provide a title, name, or service identifier.');
      return;
    }
    if (category === 'note' && !notes.trim()) {
      setError('Note content cannot be empty.');
      return;
    }
    if ((category === 'image' || category === 'video' || category === 'audio' || category === 'file') && !fileUrl) {
      setError('Please upload a file to Cloudinary or paste a media link.');
      return;
    }

    onSave({
      category,
      service: service.trim() || fileName.trim(),
      username: username.trim(),
      password,
      backupCodes: backupCodes.trim(),
      notes: notes.trim(),
      url: url.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileSize,
      fileType: fileType.trim(),
      publicId: publicId.trim()
    });
  };

  const categories: Array<{ id: VaultCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'credential', label: 'Login Key', icon: Key },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'file', label: 'File / Doc', icon: FileUp },
    { id: 'link', label: 'Link', icon: LinkIcon },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'note', label: 'Text Note', icon: FileText },
    { id: 'backup', label: '2FA Backup', icon: Shield }
  ];

  const isMediaCategory = ['image', 'video', 'audio', 'file'].includes(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl p-6 sm:p-7 rounded-3xl liquid-glass-elevated border border-white/20 text-neutral-100 shadow-2xl relative my-6 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {item ? 'Modify Encrypted Entry' : 'New Encrypted Item'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Zero-knowledge client-side encryption. Stored safely in Cloudinary & Firebase.
            </p>
          </div>
          <button
            onClick={() => {
              playLiquidClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Category Switcher Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Classification
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
              {categories.map((c) => {
                const Icon = c.icon;
                const isActive = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      playLiquidClick();
                      setCategory(c.id);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer truncate ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Service Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              {category === 'contact' ? 'Contact Name' : category === 'link' ? 'Bookmark Title' : 'Title / Service'}
              {category !== 'note' && <span className="text-white"> *</span>}
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder={
                category === 'contact'
                  ? 'e.g. John Doe, Dr. Sarah'
                  : category === 'link'
                  ? 'e.g. Personal Cloud Drive, Research Portal'
                  : 'e.g. GitHub, Google Cloud, Bank of America, Project Asset'
              }
              required={category !== 'note'}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500"
            />
          </div>

          {/* CLOUDINARY UPLOAD SECTION FOR MEDIA / FILES */}
          {isMediaCategory && (
            <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cloudinary Storage Upload</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-500">Preset: ml_default</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isUploading
                    ? 'border-white/40 bg-white/[0.04]'
                    : fileUrl
                    ? 'border-white/20 bg-white/[0.02] hover:border-white/30'
                    : 'border-white/15 hover:border-white/30 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    category === 'image'
                      ? 'image/*'
                      : category === 'video'
                      ? 'video/*'
                      : category === 'audio'
                      ? 'audio/*'
                      : '*/*'
                  }
                  className="hidden"
                />

                {isUploading ? (
                  <div className="space-y-2 py-2">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-xs text-white font-medium">Uploading to Cloudinary...</p>
                    <div className="w-48 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-neutral-400">{uploadProgress}%</span>
                  </div>
                ) : fileUrl ? (
                  <div className="space-y-2 py-1">
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <Check className="w-4 h-4" />
                      <span>Ready in Vault</span>
                    </div>
                    <p className="text-xs text-white font-mono truncate max-w-sm mx-auto">{fileName || 'Uploaded Media'}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {formatBytes(fileSize)} · Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto" />
                    <p className="text-xs text-white font-medium">
                      Click to upload {category} to Cloudinary
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Files are transferred securely & encrypted into your vault
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}

              {/* Or Direct URL Input */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Or Paste Direct Cloudinary / Resource URL
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/yuasb9xa/..."
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono liquid-glass-input placeholder:text-neutral-500"
                />
              </div>
            </div>
          )}

          {/* LINK CATEGORY URL */}
          {category === 'link' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Target URL / Web Address <span className="text-white">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/vault-resource"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono liquid-glass-input placeholder:text-neutral-500"
              />
            </div>
          )}

          {/* CONTACT CATEGORY: PHONE NUMBER & EMAIL */}
          {category === 'contact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono liquid-glass-input placeholder:text-neutral-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500"
                />
              </div>
            </div>
          )}

          {/* CREDENTIAL FIELDS */}
          {category === 'credential' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Username / Account Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@domain.com or account handle"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate strong</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl text-sm font-mono liquid-glass-input placeholder:text-neutral-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playLiquidClick();
                        setShowPassword(!showPassword);
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden border border-white/10 p-[0.5px]">
                      <div
                        className="h-full bg-gradient-to-r from-white/40 to-white rounded-full transition-all duration-300"
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Entropy: {strength.label}</span>
                      <span className="tabular-nums">{Math.round(strength.percent)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* BACKUP CODES */}
          {category === 'backup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Recovery / 2FA Backup Codes
              </label>
              <textarea
                value={backupCodes}
                onChange={(e) => setBackupCodes(e.target.value)}
                placeholder="Paste backup codes (one per line, e.g. 8493-2940)..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono liquid-glass-input placeholder:text-neutral-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {/* NOTES / SECRETS */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              {category === 'note' ? 'Secure Text Content' : 'Encrypted Notes & Details'} {category === 'note' && <span className="text-white">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private instructions, security questions, or notes..."
              rows={category === 'note' ? 5 : 2}
              required={category === 'note'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs liquid-glass-input placeholder:text-neutral-500 leading-relaxed resize-y"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08] shrink-0">
            <button
              type="button"
              onClick={() => {
                playLiquidClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium liquid-btn-ghost cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl text-xs font-semibold liquid-btn-primary cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{item ? 'Save Modifications' : 'Encrypt & Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
