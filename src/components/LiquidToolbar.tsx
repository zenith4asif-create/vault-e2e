import React from 'react';
import {
  Search,
  Plus,
  KeyRound,
  Key,
  Image as ImageIcon,
  Video,
  Music,
  FileUp,
  Link as LinkIcon,
  Phone,
  FileText,
  Shield,
  Layers
} from 'lucide-react';
import { VaultCategory } from '../types/vault';
import { playLiquidClick } from '../services/audio';

interface LiquidToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: 'all' | VaultCategory;
  onFilterChange: (filter: 'all' | VaultCategory) => void;
  onAddItem: () => void;
  onQuickGenerate: () => void;
  countsByCategory: Record<string, number>;
}

export const LiquidToolbar: React.FC<LiquidToolbarProps> = ({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onAddItem,
  onQuickGenerate,
  countsByCategory
}) => {
  const filterOptions: Array<{
    id: 'all' | VaultCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'credential', label: 'Credentials', icon: Key },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'file', label: 'Files', icon: FileUp },
    { id: 'link', label: 'Links', icon: LinkIcon },
    { id: 'contact', label: 'Contacts', icon: Phone },
    { id: 'note', label: 'Notes', icon: FileText },
    { id: 'backup', label: '2FA', icon: Shield }
  ];

  return (
    <div className="space-y-3.5 mb-6">
      {/* Top row: Search input and Primary actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search credentials, media files, links, contacts, notes..."
            className="w-full pl-10 pr-16 py-2.5 rounded-xl text-sm liquid-glass-input placeholder:text-neutral-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/10"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          <button
            onClick={() => {
              playLiquidClick();
              onQuickGenerate();
            }}
            title="Generate secure password"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl liquid-btn-ghost cursor-pointer whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-neutral-300" />
            <span>Key Generator</span>
          </button>

          <button
            onClick={() => {
              playLiquidClick();
              onAddItem();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl liquid-btn-primary cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Vault</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs Bar (Horizontal scrolling on small screens, wrap on desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none no-scrollbar">
        {filterOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeFilter === opt.id;
          const count = countsByCategory[opt.id] ?? 0;
          return (
            <button
              key={opt.id}
              onClick={() => {
                playLiquidClick();
                onFilterChange(opt.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'bg-black/30 border border-white/[0.05] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{opt.label}</span>
              {count > 0 && (
                <span className="font-mono text-[10px] text-neutral-400 ml-0.5 tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
