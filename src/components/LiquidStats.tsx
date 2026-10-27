import React from 'react';
import { VaultItem } from '../types/vault';
import { Key, HardDrive, FileUp, Phone, Cloud } from 'lucide-react';
import { formatBytes } from '../services/cloudinary';

interface LiquidStatsProps {
  items: VaultItem[];
  lastUpdated?: number;
}

export const LiquidStats: React.FC<LiquidStatsProps> = ({ items, lastUpdated }) => {
  const credentialsCount = items.filter(i => (i.category || 'credential') === 'credential').length;
  const mediaCount = items.filter(i => ['image', 'video', 'audio'].includes(i.category)).length;
  const filesCount = items.filter(i => i.category === 'file').length;
  const contactsLinksCount = items.filter(i => ['contact', 'link'].includes(i.category)).length;

  const totalBytes = items.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const formatDate = (ts?: number) => {
    if (!ts) return 'Live Sync';
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const statCards = [
    {
      label: 'Total Items',
      value: items.length,
      icon: HardDrive,
      desc: 'Encrypted records'
    },
    {
      label: 'Credentials',
      value: credentialsCount,
      icon: Key,
      desc: 'PBKDF2 secured'
    },
    {
      label: 'Cloud Media',
      value: mediaCount,
      icon: Cloud,
      desc: 'Photos, videos, audio'
    },
    {
      label: 'Documents & Files',
      value: filesCount,
      icon: FileUp,
      desc: totalBytes > 0 ? formatBytes(totalBytes) : 'Encrypted assets'
    },
    {
      label: 'Contacts & Links',
      value: contactsLinksCount,
      icon: Phone,
      desc: `Synced ${formatDate(lastUpdated)}`
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl liquid-glass transition-all duration-200 hover:border-white/20 flex flex-col justify-between ${
              idx === 4 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
                {stat.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-neutral-500" />
            </div>

            <div>
              <div className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
                {stat.value}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 truncate">
                {stat.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
