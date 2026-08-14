# S&P 500 Company Sorter

A simple Bash script that downloads the supplied S&P 500 CSV dataset and outputs:

- Company name
- Location
- Founding year

The results are sorted by founding year from oldest to newest.

## Data source

`https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv`

## Requirements

- Bash
- `curl` or `wget`
- `awk` and `sort`

## Run

Make the script executable:

```bash
chmod +x get_sp500_awk.sh
```

Run with the default CSV URL:

```bash
./get_sp500_awk.sh
```

A custom CSV URL can also be supplied:

```bash
./get_sp500_awk.sh "https://example.com/companies.csv"
```

## Example output

```text
Year     | Company Name                             | Location
--------------------------------------------------------------------------------
1784     | BNY Mellon                               | New York City, New York
1806     | Colgate-Palmolive                        | New York City, New York
1818     | Bunge Global                             | Chesterfield, Missouri
...
```

The script handles quoted CSV fields so locations or company names containing commas are parsed correctly.
