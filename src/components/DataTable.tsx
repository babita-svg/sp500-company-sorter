import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Copy, Check, Filter } from 'lucide-react';
import { SPCompany, SortField, SortOrder } from '../types';

interface DataTableProps {
  companies: SPCompany[];
}

export const DataTable: React.FC<DataTableProps> = ({ companies }) => {
  const [search, setSearch] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('foundedYear');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copied, setCopied] = useState(false);

  // Filter & Search
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        search === '' ||
        c.security.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()) ||
        c.headquarters.toLowerCase().includes(search.toLowerCase()) ||
        c.founded.toLowerCase().includes(search.toLowerCase()) ||
        c.sector.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedEra === '18th') return c.foundedYear < 1800;
      if (selectedEra === '19th') return c.foundedYear >= 1800 && c.foundedYear < 1900;
      if (selectedEra === 'early20th') return c.foundedYear >= 1900 && c.foundedYear < 1950;
      if (selectedEra === 'late20th') return c.foundedYear >= 1950 && c.foundedYear < 2000;
      if (selectedEra === '21st') return c.foundedYear >= 2000;

      return true;
    });
  }, [companies, search, selectedEra]);

  // Sort
  const sortedCompanies = useMemo(() => {
    const list = [...filteredCompanies];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'foundedYear') {
        comparison = a.foundedYear - b.foundedYear;
      } else if (sortField === 'security') {
        comparison = a.security.localeCompare(b.security);
      } else if (sortField === 'headquarters') {
        comparison = a.headquarters.localeCompare(b.headquarters);
      } else if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      }

      if (comparison === 0) {
        // secondary tie-breaker
        comparison = a.security.localeCompare(b.security);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredCompanies, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedCompanies.length / pageSize) || 1;
  const currentRecords = useMemo(() => {
    if (pageSize === -1) return sortedCompanies;
    const start = (currentPage - 1) * pageSize;
    return sortedCompanies.slice(start, start + pageSize);
  }, [sortedCompanies, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const header = ['Company Name', 'Headquarters Location', 'Founded Year', 'Symbol', 'GICS Sector'];
    const rows = sortedCompanies.map((c) => [
      `"${c.security.replace(/"/g, '""')}"`,
      `"${c.headquarters.replace(/"/g, '""')}"`,
      `"${c.founded.replace(/"/g, '""')}"`,
      c.symbol,
      `"${c.sector.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sp500_companies_by_founding_year.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTSV = () => {
    const header = 'Company Name\tHeadquarters Location\tFounded Year\tSymbol';
    const rows = sortedCompanies.map((c) => `${c.security}\t${c.headquarters}\t${c.founded}\t${c.symbol}`);
    const tsvContent = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  return (
    <div id="company-data-table-container" className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-[#10131F] border border-[#1C2236] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="company-search-input"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by company name, city, state, symbol..."
            className="w-full pl-9 pr-8 py-2 bg-[#0A0D16] border border-[#222A40] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Era Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 font-medium">
            <Filter className="w-3 h-3 text-indigo-400" /> Era:
          </span>
          {[
            { id: 'all', label: 'All Eras' },
            { id: '18th', label: '<1800' },
            { id: '19th', label: '1800-1899' },
            { id: 'early20th', label: '1900-1949' },
            { id: 'late20th', label: '1950-1999' },
            { id: '21st', label: '2000+' },
          ].map((era) => (
            <button
              key={era.id}
              onClick={() => {
                setSelectedEra(era.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                selectedEra === era.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 border border-indigo-500'
                  : 'bg-[#151926] text-slate-400 hover:text-slate-200 hover:bg-[#1C2338] border border-[#222A40]'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            id="copy-tsv-btn"
            onClick={handleCopyTSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#151926] hover:bg-[#1C2338] text-slate-200 border border-[#222A40] rounded-xl transition-colors cursor-pointer"
            title="Copy current filtered data as Tab-Separated Values"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy TSV'}</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0E111C] border border-[#1C2236] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0A0D16] text-xs font-semibold text-slate-400 border-b border-[#1C2236] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center text-slate-500">#</th>
                <th
                  onClick={() => handleSort('security')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company Name</span>
                    {getSortIcon('security')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('headquarters')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Headquarters Location</span>
                    {getSortIcon('headquarters')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('foundedYear')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Founding Year</span>
                    {getSortIcon('foundedYear')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors group hidden sm:table-cell"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ticker</span>
                    {getSortIcon('symbol')}
                  </div>
                </th>
                <th className="py-3.5 px-4 hidden md:table-cell">GICS Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B2B]">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching companies found for the selected query and era filter.
                  </td>
                </tr>
              ) : (
                currentRecords.map((comp, idx) => {
                  const globalIdx = (currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + idx + 1;
                  const is18th = comp.foundedYear < 1800;
                  const is19th = comp.foundedYear >= 1800 && comp.foundedYear < 1900;
                  const is21st = comp.foundedYear >= 2000;

                  return (
                    <tr
                      key={comp.symbol + '-' + idx}
                      className="hover:bg-[#14192A]/70 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-xs text-slate-500 font-mono">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {comp.security}
                        </div>
                        <div className="text-xs text-slate-400 sm:hidden mt-0.5">
                          Ticker: <span className="font-mono text-slate-300">{comp.symbol}</span> • {comp.sector}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {comp.headquarters}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold px-2.5 py-0.5 rounded-lg text-xs ${
                              is18th
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                : is19th
                                ? 'bg-amber-900/30 text-amber-200 border border-amber-700/30'
                                : is21st
                                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                                : 'bg-[#151926] text-slate-200 border border-[#222A40]'
                            }`}
                          >
                            {comp.founded}
                          </span>
                          {is18th && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Pioneer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-semibold hidden sm:table-cell">
                        {comp.symbol}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">
                        {comp.sector}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Footer */}
        <div className="p-4 bg-[#0A0D16] border-t border-[#1C2236] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-200">
              {sortedCompanies.length > 0 ? (currentPage - 1) * (pageSize === -1 ? 0 : pageSize) + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-200">
              {pageSize === -1 ? sortedCompanies.length : Math.min(currentPage * pageSize, sortedCompanies.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{sortedCompanies.length}</span> companies
            {sortedCompanies.length !== companies.length && (
              <span className="text-slate-500"> (filtered from {companies.length} total)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="bg-[#121624] border border-[#222A40] rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All ({companies.length})</option>
              </select>
            </div>

            {pageSize !== -1 && (
              <div className="flex items-center gap-1">
                <button
                  id="prev-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-[#121624] border border-[#222A40] text-slate-300 hover:bg-[#1A2030] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2.5 font-mono text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  id="next-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-[#121624] border border-[#222A40] text-slate-300 hover:bg-[#1A2030] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
