import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DataTable } from './components/DataTable';
import { ScriptViewer } from './components/ScriptViewer';
import { TerminalSimulator } from './components/TerminalSimulator';
import { SPCompany, ActiveTab } from './types';
import { parseCSV, CSV_URL } from './data/parser';
import { AlertCircle, Terminal, Code, Database, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');
  const [companies, setCompanies] = useState<SPCompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: HTTP ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        throw new Error('No company records found in the retrieved CSV data.');
      }
      setCompanies(parsed);
    } catch (err: any) {
      console.error('Error fetching CSV:', err);
      setError(err?.message || 'Failed to download or parse S&P 500 CSV data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        onRefresh={fetchDataset}
        totalCompanies={companies.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div
            id="error-banner"
            className="mb-6 p-4.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3 shadow-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Failed to Load CSV Dataset</h3>
              <p className="text-xs text-red-300/90 mt-1">{error}</p>
              <button
                onClick={fetchDataset}
                className="mt-3 px-3.5 py-1.5 bg-red-900/80 hover:bg-red-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-red-700/50"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && companies.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-[#10131F] border border-[#1C2236] shadow-xl mb-4">
              <Terminal className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white">Loading S&P 500 Constituents...</h3>
            <p className="text-sm text-slate-400 mt-1">
              Fetching and parsing live CSV from GitHub repository
            </p>
          </div>
        )}

        {/* Loaded Content */}
        {(!isLoading || companies.length > 0) && (
          <>
            {/* Summary Metrics */}
            <StatsBar companies={companies} />

            {/* Quick Shell Script Banner if on table view */}
            {activeTab === 'table' && (
              <div className="mb-4 bg-[#10131F] border border-[#1C2236] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Need the shell command?</span>{' '}
                    <span className="text-slate-400">
                      Run <code className="font-mono text-indigo-300 bg-[#07080F] px-2 py-0.5 rounded-lg border border-[#222A40]">./get_sp500_companies.sh</code> in your terminal
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => setActiveTab('script')}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>View Shell Script</span>
                  </button>
                  <span className="text-slate-700">•</span>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium cursor-pointer transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Terminal Preview</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Tab View */}
            {activeTab === 'table' && <DataTable companies={companies} />}

            {activeTab === 'script' && (
              <ScriptViewer onRunInTerminal={() => setActiveTab('terminal')} />
            )}

            {activeTab === 'terminal' && <TerminalSimulator companies={companies} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#161B2B] bg-[#07080F] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            S&P 500 Constituent Data & Shell Automation Tool • Sorted by Chronological Founding Year
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            CSV: github.com/datasets/s-and-p-500-companies
          </div>
        </div>
      </footer>
    </div>
  );
}
