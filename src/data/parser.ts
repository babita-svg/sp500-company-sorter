import { SPCompany } from '../types';

export const CSV_URL =
  'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv';

export function parseCSV(csvText: string): SPCompany[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const companies: SPCompany[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV handling quoted fields with commas
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    if (fields.length >= 8) {
      const symbol = fields[0];
      const security = fields[1];
      const sector = fields[2];
      const subIndustry = fields[3];
      const headquarters = fields[4].replace(/^"|"$/g, '');
      const dateAdded = fields[5];
      const cik = fields[6];
      const founded = fields[7].replace(/^"|"$/g, '');

      // Extract 4-digit years
      const yearMatches = founded.match(/\b(1\d{3}|20\d{2})\b/g);
      let foundedYear = 9999;
      if (yearMatches && yearMatches.length > 0) {
        const numericYears = yearMatches.map((y) => parseInt(y, 10));
        foundedYear = Math.min(...numericYears);
      }

      companies.push({
        symbol,
        security,
        sector,
        subIndustry,
        headquarters,
        dateAdded,
        cik,
        founded: founded || 'N/A',
        foundedYear,
      });
    }
  }

  // Default sort: Chronological founding year, then company name
  companies.sort((a, b) => {
    if (a.foundedYear !== b.foundedYear) {
      return a.foundedYear - b.foundedYear;
    }
    return a.security.localeCompare(b.security);
  });

  return companies;
}
