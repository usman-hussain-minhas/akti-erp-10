# P4A-004 No-Secret Policy

- Do not commit real .env files.
- Do not commit production credentials, production database URLs, provider tokens, private keys, or session values.
- .env.local.example and .env.demo.example may contain placeholders only.
- DATABASE_URL examples must point to local/demo hosts only.
- Redaction scans that match words like secret or token are inspection evidence; real values fail the ticket, placeholders are acceptable only when explicitly identified.

## Redaction Review

The scan in env-template-scan.txt matches placeholder variable names and comments only. No real secret, credential, token, private key, production database URL, or session value was found.
