import React, { useState, useMemo } from 'react';
import { Play, Copy, Check, RotateCcw, Download, Terminal as TerminalIcon } from 'lucide-react';
import { SPCompany, OutputFormat } from '../types';

interface TerminalSimulatorProps {
  companies: SPCompany[];
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({ companies }) => {
  const [format, setFormat] = useState<OutputFormat>('table');
  const [limit, setLimit] = useState<number>(30);
  const [copied, setCopied] = useState(false);

  // Generate simulated command output matching the bash script
  const outputText = useMemo(() => {
    const sorted = [...companies].sort((a, b) => {
      if (a.foundedYear !== b.foundedYear) return a.foundedYear - b.foundedYear;
      return a.security.localeCompare(b.security);
    });

    const dataset = limit > 0 ? sorted.slice(0, limit) : sorted;

    if (format === 'csv') {
      const header = 'Company Name,Headquarters Location,Founded Year';
      const rows = dataset.map(
        (c) => `"${c.security.replace(/"/g, '""')}","${c.headquarters.replace(/"/g, '""')}","${c.founded}"`
      );
      return [header, ...rows].join('\n');
    }

    if (format === 'tsv') {
      const header = 'Company Name\tHeadquarters Location\tFounded Year';
      const rows = dataset.map((c) => `${c.security}\t${c.headquarters}\t${c.founded}`);
      return [header, ...rows].join('\n');
    }

    if (format === 'json') {
      const jsonList = dataset.map((c) => ({
        company: c.security,
        location: c.headquarters,
        founded: c.founded,
        sort_year: c.foundedYear === 9999 ? null : c.foundedYear,
      }));
      return JSON.stringify(jsonList, null, 2);
    }

    // Default table format
    const colCompany = 40;
    const colLoc = 34;
    const colYear = 18;

    const pad = (str: string, length: number) => {
      return str.length >= length ? str.substring(0, length) : str + ' '.repeat(length - str.length);
    };

    const header = `${pad('Company Name', colCompany)} | ${pad('Headquarters Location', colLoc)} | ${pad('Founded Year', colYear)}`;
    const divider = '-'.repeat(header.length);

    const rows = dataset.map(
      (c) => `${pad(c.security, colCompany)} | ${pad(c.headquarters, colLoc)} | ${pad(c.founded, colYear)}`
    );

    return [header, divider, ...rows].join('\n');
  }, [companies, format, limit]);

  const commandString = useMemo(() => {
    const flag = format === 'table' ? '' : ` --${format}`;
    const pipeLimit = limit > 0 ? ` | head -n ${limit + (format === 'table' ? 2 : 1)}` : '';
    return `./get_sp500_companies.sh${flag}${pipeLimit}`;
  }, [format, limit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sp500_output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="terminal-simulator-container" className="bg-[#07080F] border border-[#1C2236] rounded-2xl overflow-hidden shadow-2xl">
      {/* Terminal Window Header */}
      <div className="bg-[#0D0F17] px-4 py-3 border-b border-[#1C2236] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 ml-2 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
            bash — 80x24 (Live Terminal Execution Preview)
          </span>
        </div>

        {/* Output Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Selector */}
          <div className="flex items-center rounded-xl bg-[#07080F] p-0.5 border border-[#1C2236] text-xs">
            {(['table', 'csv', 'tsv', 'json'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                  format === fmt
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Rows limit */}
          <select
            id="terminal-limit-select"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="bg-[#07080F] border border-[#1C2236] text-slate-300 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value={15}>Top 15 rows</option>
            <option value={30}>Top 30 rows</option>
            <option value={50}>Top 50 rows</option>
            <option value={100}>Top 100 rows</option>
            <option value={0}>All ({companies.length})</option>
          </select>

          <button
            id="copy-terminal-output-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#151926] hover:bg-[#1C2338] text-slate-200 border border-[#222A40] rounded-xl transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="download-terminal-output-btn"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#151926] hover:bg-[#1C2338] text-slate-200 border border-[#222A40] rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed overflow-x-auto max-h-[550px] bg-[#07080F]">
        {/* Command Line Prompt */}
        <div className="flex items-center gap-2 text-slate-400 mb-3 select-none pb-2 border-b border-[#1C2236]/60">
          <span className="text-emerald-400 font-semibold">user@server:~$</span>
          <span className="text-white font-semibold">{commandString}</span>
        </div>

        {/* Output */}
        <pre className="text-slate-300 font-mono text-xs sm:text-xs leading-5 whitespace-pre selection:bg-indigo-500/30 selection:text-white">
          {outputText}
        </pre>
      </div>

      {/* Terminal Footer Info */}
      <div className="bg-[#0D0F17] px-4 py-2.5 border-t border-[#1C2236] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Exit Code: 0 (Success)</span>
        </div>
        <div className="text-slate-500">
          {limit > 0 ? `Showing ${Math.min(limit, companies.length)} of ${companies.length} entries` : `Showing all ${companies.length} entries`}
        </div>
      </div>
    </div>
  );
};
