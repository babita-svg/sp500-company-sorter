import React from 'react';
import { Calendar, Building2, MapPin, TrendingUp } from 'lucide-react';
import { SPCompany } from '../types';

interface StatsBarProps {
  companies: SPCompany[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ companies }) => {
  if (companies.length === 0) return null;

  // Oldest company
  const validFounded = companies.filter((c) => c.foundedYear < 9999);
  const oldest = validFounded[0];
  const newest = validFounded[validFounded.length - 1];

  // Century counts
  const eighteenth = validFounded.filter((c) => c.foundedYear < 1800).length;
  const nineteenth = validFounded.filter((c) => c.foundedYear >= 1800 && c.foundedYear < 1900).length;
  const twentieth = validFounded.filter((c) => c.foundedYear >= 1900 && c.foundedYear < 2000).length;
  const twentyFirst = validFounded.filter((c) => c.foundedYear >= 2000).length;

  return (
    <div id="stats-bar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <div className="bg-[#10131F]/90 border border-[#1C2236] hover:border-slate-700/70 transition-all p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-400">Total Companies</div>
          <div className="text-xl font-bold text-white mt-0.5 tracking-tight">{companies.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">S&P 500 Constituents</div>
        </div>
      </div>

      <div className="bg-[#10131F]/90 border border-[#1C2236] hover:border-slate-700/70 transition-all p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-400">Oldest Pioneer</div>
          <div className="text-base sm:text-lg font-bold text-amber-300 truncate max-w-[170px]" title={oldest?.security}>
            {oldest ? oldest.security : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Founded <span className="font-mono font-semibold text-amber-400">{oldest?.foundedYear}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#10131F]/90 border border-[#1C2236] hover:border-slate-700/70 transition-all p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-400">Era Breakdown</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-400 font-mono">{eighteenth + nineteenth}</span> <span className="text-xs text-slate-400">&lt;1900</span> •
            <span className="text-cyan-400 font-mono">{twentieth}</span> <span className="text-xs text-slate-400">20th C</span> •
            <span className="text-indigo-400 font-mono">{twentyFirst}</span> <span className="text-xs text-slate-400">21st C</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Chronological Distribution</div>
        </div>
      </div>

      <div className="bg-[#10131F]/90 border border-[#1C2236] hover:border-slate-700/70 transition-all p-4.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-400">Newest Company / Spinoff</div>
          <div className="text-base sm:text-lg font-bold text-violet-300 truncate max-w-[170px]" title={newest?.security}>
            {newest ? newest.security : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[170px]">
            {newest?.founded} ({newest?.headquarters.split(',')[1]?.trim() || newest?.headquarters})
          </div>
        </div>
      </div>
    </div>
  );
};
