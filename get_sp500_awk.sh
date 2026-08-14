#!/usr/bin/env bash
# ==============================================================================
# S&P 500 Companies Extractor (Pure Bash & AWK version)
# Outputs Company Name, Headquarters Location, and Founding Year sorted by year.
# ==============================================================================

set -euo pipefail

CSV_URL="${1:-https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv}"
TAB=$(printf "\t")

curl -sL "$CSV_URL" | awk -v tab="$TAB" '
NR == 1 { next }
{
    line = $0
    len = length(line)
    in_quotes = 0
    field_idx = 1
    delete fields
    curr = ""
    
    for (i = 1; i <= len; i++) {
        c = substr(line, i, 1)
        if (c == "\"") {
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
    
    # Extract earliest 4-digit year for sorting key
    sort_year = 9999
    if (match(founded, /[12][0-9][0-9][0-9]/)) {
        sort_year = substr(founded, RSTART, 4) + 0
    }
    
    if (company != "") {
        printf "%04d%s%s%s%s%s%s\n", sort_year, tab, company, tab, location, tab, (founded ? founded : "N/A")
    }
}' | sort -t "$TAB" -k1,1n -k2,2 | awk -F"\t" '
BEGIN {
    printf "%-40s | %-32s | %-16s\n", "Company Name", "Headquarters Location", "Founded Year"
    print "--------------------------------------------------------------------------------------------"
}
{
    printf "%-40s | %-32s | %-16s\n", $2, $3, $4
}'
