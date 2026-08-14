#!/usr/bin/env bash
# ==============================================================================
# S&P 500 Companies Extractor (Company Name, Location, Founding Year - Sorted)
# 
# Usage:
#   ./get_sp500_companies.sh [CSV_URL]
#   ./get_sp500_companies.sh --csv [CSV_URL]
#   ./get_sp500_companies.sh --json [CSV_URL]
# ==============================================================================

set -euo pipefail

FORMAT="table"
CSV_URL="https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --csv)
      FORMAT="csv"
      shift
      ;;
    --json)
      FORMAT="json"
      shift
      ;;
    --tsv)
      FORMAT="tsv"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--csv|--tsv|--json] [CSV_URL]"
      echo "Outputs Company Name, Headquarters Location, and Founding Year sorted by year."
      exit 0
      ;;
    *)
      CSV_URL="$1"
      shift
      ;;
  esac
done

# Fetch data using curl or wget
if command -v curl &>/dev/null; then
    FETCH_DATA=$(curl -sL "$CSV_URL")
elif command -v wget &>/dev/null; then
    FETCH_DATA=$(wget -qO- "$CSV_URL")
else
    echo "Error: curl or wget is required to run this script." >&2
    exit 1
fi

# Parse CSV RFC 4180 and output sorted results
python3 -c '
import sys, csv, re, json, io

format_type = sys.argv[1]
raw_data = sys.stdin.read()

if not raw_data.strip():
    sys.stderr.write("Error: Empty response from URL\n")
    sys.exit(1)

try:
    reader = csv.DictReader(io.StringIO(raw_data))
    records = []
    
    for row in reader:
        company = row.get("Security", "").strip()
        location = row.get("Headquarters Location", "").strip()
        founded_raw = row.get("Founded", "").strip()
        
        # Extract earliest 4-digit founding year for chronological sorting
        years = [int(y) for y in re.findall(r"\b(1\d{3}|20\d{2})\b", founded_raw)]
        sort_year = min(years) if years else 9999
        
        records.append({
            "sort_year": sort_year,
            "company": company,
            "location": location,
            "founded": founded_raw if founded_raw else "N/A"
        })
    
    # Sort primarily by founding year ascending, then by company name
    records.sort(key=lambda r: (r["sort_year"], r["company"].lower()))
    
    if format_type == "csv":
        writer = csv.writer(sys.stdout)
        writer.writerow(["Company Name", "Headquarters Location", "Founded Year"])
        for r in records:
            writer.writerow([r["company"], r["location"], r["founded"]])
            
    elif format_type == "tsv":
        print("Company Name\tHeadquarters Location\tFounded Year")
        for r in records:
            comp = r["company"]
            loc = r["location"]
            fnd = r["founded"]
            print(f"{comp}\t{loc}\t{fnd}")
            
    elif format_type == "json":
        output_list = [{"company": r["company"], "location": r["location"], "founded": r["founded"], "year": r["sort_year"] if r["sort_year"] != 9999 else None} for r in records]
        print(json.dumps(output_list, indent=2))
        
    else:
        # Table format
        col_w_comp = 40
        col_w_loc = 34
        col_w_year = 18
        
        h_comp = "Company Name"
        h_loc = "Headquarters Location"
        h_year = "Founded Year"
        
        header = f"{h_comp:<{col_w_comp}} | {h_loc:<{col_w_loc}} | {h_year:<{col_w_year}}"
        divider = "-" * len(header)
        
        print(header)
        print(divider)
        for r in records:
            comp = r["company"]
            loc = r["location"]
            fnd = r["founded"]
            print(f"{comp:<{col_w_comp}} | {loc:<{col_w_loc}} | {fnd:<{col_w_year}}")

except BrokenPipeError:
    # Handle downstream pipe closings cleanly (e.g. | head)
    sys.stderr.close()
    sys.exit(0)
except Exception as e:
    sys.stderr.write(f"Error parsing data: {e}\n")
    sys.exit(1)
' "$FORMAT" <<< "$FETCH_DATA"
