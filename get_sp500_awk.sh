#!/usr/bin/env bash
# Fetch the S&P 500 CSV and print company name, location, and founding year
# sorted from oldest to newest.

set -euo pipefail

CSV_URL="${1:-https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv}"

if command -v curl >/dev/null 2>&1; then
    FETCH_CMD=(curl -fsSL "$CSV_URL")
elif command -v wget >/dev/null 2>&1; then
    FETCH_CMD=(wget -qO- "$CSV_URL")
else
    echo "Error: curl or wget is required." >&2
    exit 1
fi

"${FETCH_CMD[@]}" |
awk '
NR == 1 { next }
{
    # Parse CSV while respecting quoted commas.
    line = $0
    len = length(line)
    quoted = 0
    field = 1
    value = ""
    delete fields

    for (i = 1; i <= len; i++) {
        ch = substr(line, i, 1)
        if (ch == "\"") {
            quoted = !quoted
        } else if (ch == "," && !quoted) {
            fields[field++] = value
            value = ""
        } else {
            value = value ch
        }
    }
    fields[field] = value

    company = fields[2]
    location = fields[5]
    founded = fields[8]

    gsub(/^"|"$/, "", company)
    gsub(/^"|"$/, "", location)
    gsub(/^"|"$/, "", founded)

    if (match(founded, /[12][0-9][0-9][0-9]/)) {
        year = substr(founded, RSTART, 4)
        printf "%s\t%s\t%s\n", year, company, location
    }
}' |
sort -t $'\t' -k1,1n -k2,2 |
awk -F '\t' '
BEGIN {
    printf "%-8s | %-40s | %s\n", "Year", "Company Name", "Location"
    print "--------------------------------------------------------------------------------"
}
{
    printf "%-8s | %-40s | %s\n", $1, $2, $3
}'
