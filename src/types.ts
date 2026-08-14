export interface SPCompany {
  symbol: string;
  security: string; // Company Name
  sector: string;
  subIndustry: string;
  headquarters: string; // Location
  dateAdded: string;
  cik: string;
  founded: string; // Raw founded string, e.g. "1902", "2013 (1888)"
  foundedYear: number; // Parsed numeric year for sorting
}

export type SortField = 'foundedYear' | 'security' | 'headquarters' | 'symbol';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'table' | 'terminal' | 'script';
export type OutputFormat = 'table' | 'csv' | 'tsv' | 'json';
export type ScriptType = 'python_bash' | 'pure_awk' | 'one_liner';
