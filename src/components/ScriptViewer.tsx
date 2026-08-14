import React, { useState } from 'react';
import { Copy, Check, Terminal, Download, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { ScriptType } from '../types';

interface ScriptViewerProps {
  onRunInTerminal: () => void;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({ onRunInTerminal }) => {
  const [selectedScript, setSelectedScript] = useState<ScriptType>('python_bash');
  const [copied, setCopied] = useState(false);

  const pythonBashScript = `#!/usr/bin/env bash
# ==============================================================================
# S&P 500 Companies Extractor (Company Name, Location, Founding Year - Sorted)
# URL: https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv
# ==============================================================================

set -euo pipefail

CSV_URL="\${1:-https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv}"

# Fetch via curl or wget
if command -v curl &>/dev/null; then
    FETCH_DATA=$(curl -sL "$CSV_URL")
elif command -v wget &>/dev/null; then
    FETCH_DATA=$(wget -qO- "$CSV_URL")
else
    echo "Error: curl or wget is required." >&2
    exit 1
fi

# Parse RFC-4180 CSV & sort chronologically by founding year
python3 -c '
import sys, csv, re, io

raw_data = sys.stdin.read()
if not raw_data.strip():
    sys.exit(1)

reader = csv.DictReader(io.StringIO(raw_data))
records = []

for row in reader:
    company = row.get("Security", "").strip()
    location = row.get("Headquarters Location", "").strip()
    founded_raw = row.get("Founded", "").strip()
    
    # Extract 4-digit founding years (earliest first, e.g. "2013 (1888)" -> 1888)
    years = [int(y) for y in re.findall(r"\\b(1\\d{3}|20\\d{2})\\b", founded_raw)]
    sort_year = min(years) if years else 9999
    
    records.append({
        "sort_year": sort_year,
        "company": company,
        "location": location,
        "founded": founded_raw if founded_raw else "N/A"
    })

# Sort primarily by founding year ascending, secondarily by company name
records.sort(key=lambda r: (r["sort_year"], r["company"].lower()))

# Print aligned output table
col_comp, col_loc, col_year = 40, 34, 18
header = f"{\\"Company Name\\":<{col_comp}} | {\\"Headquarters Location\\":<{col_loc}} | {\\"Founded Year\\":<{col_year}}"
divider = "-" * len(header)

print(header)
print(divider)
for r in records:
    print(f"{r[\x27company\x27]:<{col_comp}} | {r[\x27location\x27]:<{col_loc}} | {r[\x27founded\x27]:<{col_year}}")
' <<< "$FETCH_DATA"
`;

  const awkScript = `#!/usr/bin/env bash
# ==============================================================================
# S&P 500 Companies Extractor (Pure POSIX AWK Version - Zero Dependencies)
# ==============================================================================

set -euo pipefail

CSV_URL="\${1:-https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv}"
TAB=$(printf "\\t")

curl -sL "$CSV_URL" | awk -v tab="$TAB" '
NR == 1 { next }
{
    line = $0
    len = length(line)
    in_quotes = 0
    field_idx = 1
    delete fields
    curr = ""
    
    # Parse RFC-4180 CSV character by character
    for (i = 1; i <= len; i++) {
        c = substr(line, i, 1)
        if (c == "\\"") {
            in_quotes = !in_quotes
        } else if (c == "," && !in_quotes) {
            fields[field_idx++] = curr
            curr = ""
        } else {
            curr = curr c
        }
    }
    fields[field_idx] = curr
    
    company = fields[2]
    location = fields[5]
    founded = fields[8]
    
    # Extract founding year
    sort_year = 9999
    if (match(founded, /[12][0-9][0-9][0-9]/)) {
        sort_year = substr(founded, RSTART, 4) + 0
    }
    
    if (company != "") {
        printf "%04d%s%s%s%s%s%s\\n", sort_year, tab, company, tab, location, tab, (founded ? founded : "N/A")
    }
}' | sort -t "$TAB" -k1,1n -k2,2 | awk -F"\\t" '
BEGIN {
    printf "%-40s | %-32s | %-16s\\n", "Company Name", "Headquarters Location", "Founded Year"
    print "--------------------------------------------------------------------------------------------"
}
{
    printf "%-40s | %-32s | %-16s\\n", $2, $3, $4
}'
`;

  const oneLiner = `curl -sL "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv" | python3 -c '
import sys, csv, re
reader = csv.DictReader(sys.stdin)
recs = []
for r in reader:
    c, l, f = r.get("Security","").strip(), r.get("Headquarters Location","").strip(), r.get("Founded","").strip()
    y = [int(x) for x in re.findall(r"\\b(1\\d{3}|20\\d{2})\\b", f)]
    recs.append((min(y) if y else 9999, c, l, f))
recs.sort(key=lambda x: (x[0], x[1].lower()))
print(f"{chr(34)}Company Name{chr(34):<38} | {chr(34)}Location{chr(34):<30} | Founded")
print("-" * 88)
for _, c, l, f in recs:
    print(f"{c:<40} | {l:<30} | {f}")
'`;

  const currentCode =
    selectedScript === 'python_bash'
      ? pythonBashScript
      : selectedScript === 'pure_awk'
      ? awkScript
      : oneLiner;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      selectedScript === 'python_bash'
        ? 'get_sp500_companies.sh'
        : selectedScript === 'pure_awk'
        ? 'get_sp500_awk.sh'
        : 'sp500_oneliner.sh';
    const blob = new Blob([currentCode], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="script-viewer-panel" className="bg-[#0E111C] border border-[#1C2236] rounded-2xl overflow-hidden shadow-xl">
      {/* Top Bar */}
      <div className="p-4 sm:p-5 bg-[#0D0F17] border-b border-[#1C2236] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Executable Shell Scripts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Select between the Python-enhanced script, zero-dependency AWK script, or 1-line command
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="run-terminal-action-btn"
            onClick={onRunInTerminal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run & Preview Output</span>
          </button>

          <button
            id="download-script-btn"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#151926] hover:bg-[#1C2338] text-slate-200 border border-[#222A40] rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sh</span>
          </button>

          <button
            id="copy-script-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#151926] hover:bg-[#1C2338] text-slate-200 border border-[#222A40] rounded-xl transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="bg-[#0A0D16] px-4 pt-3 flex flex-wrap gap-2 border-b border-[#1C2236]">
        <button
          id="select-script-python"
          onClick={() => setSelectedScript('python_bash')}
          className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            selectedScript === 'python_bash'
              ? 'bg-[#0E111C] text-indigo-400 border-t-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#121624]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>get_sp500_companies.sh (Recommended)</span>
        </button>

        <button
          id="select-script-awk"
          onClick={() => setSelectedScript('pure_awk')}
          className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            selectedScript === 'pure_awk'
              ? 'bg-[#0E111C] text-indigo-400 border-t-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#121624]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>get_sp500_awk.sh (Pure POSIX AWK)</span>
        </button>

        <button
          id="select-script-oneliner"
          onClick={() => setSelectedScript('one_liner')}
          className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            selectedScript === 'one_liner'
              ? 'bg-[#0E111C] text-indigo-400 border-t-2 border-indigo-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#121624]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>One-Liner Pipeline</span>
        </button>
      </div>

      {/* Code Display */}
      <div className="relative bg-[#07080F] p-4 sm:p-6 overflow-x-auto max-h-[500px]">
        <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre selection:bg-indigo-500/30 selection:text-white">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Usage Instructions Footer */}
      <div className="p-4 bg-[#0A0D16] border-t border-[#1C2236] text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Quick Run:</span>
          <code className="px-2.5 py-1 rounded-lg bg-[#07080F] text-indigo-300 border border-[#222A40] font-mono">
            chmod +x ./get_sp500_companies.sh && ./get_sp500_companies.sh
          </code>
        </div>
        <div className="text-slate-500">
          Sorted chronologically from oldest (1784) to newest (2020s)
        </div>
      </div>
    </div>
  );
};
