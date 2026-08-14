import React from 'react';
import { Terminal, Database, Code, RefreshCw, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types';
import { CSV_URL } from '../data/parser';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLoading: boolean;
  onRefresh: () => void;
  totalCompanies: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isLoading,
  onRefresh,
  totalCompanies,
}) => {
  return (
    <header id="main-header" className="bg-[#0D0F17]/95 backdrop-blur-md border-b border-[#1A1E2E] text-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 shadow-sm shadow-indigo-500/10">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  S&P 500 Companies Extractor
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                    Bash & AWK
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Output Company Name, Location, and Founding Year sorted chronologically
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              id="csv-source-link"
              href={CSV_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#141824] hover:bg-[#1A2030] rounded-xl border border-[#222A40] transition-colors"
            >
              <span>CSV Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-[#141824] hover:bg-[#1A2030] text-slate-200 rounded-xl border border-[#222A40] transition-all hover:border-slate-600 disabled:opacity-50 cursor-pointer"
              title="Re-fetch CSV data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>{isLoading ? 'Fetching...' : 'Reload Data'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-[#1A1E2E] -mb-px">
          <button
            id="tab-table-btn"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dataset & Table</span>
            <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              activeTab === 'table'
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                : 'bg-[#151926] text-slate-400'
            }`}>
              {totalCompanies}
            </span>
          </button>

          <button
            id="tab-script-btn"
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Shell Scripts & Commands</span>
          </button>

          <button
            id="tab-terminal-btn"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Terminal Preview</span>
          </button>
        </div>
      </div>
    </header>
  );
};
