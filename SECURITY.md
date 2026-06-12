# Security Policy

## Reporting vulnerabilities

Please report suspected vulnerabilities privately to the repository owner instead of opening a public issue. Include affected paths, reproduction steps, expected impact, and any relevant logs with secrets removed.

## Public repository operating rules

This repository may be made public for transparent CI execution, but public visibility does not grant permission to use the code, trademarks, business process material, data models, planning artifacts, screenshots, or documentation outside the owner's authorization.

Do not commit production secrets, customer data, private keys, provider tokens, database dumps, or real credentials. Runtime secrets must live in environment-specific secret storage, not in git.

## GitHub Actions security baseline

The validation workflow must run with read-only `GITHUB_TOKEN` permissions, pinned third-party actions, and checkout credentials disabled. Workflows must not use `pull_request_target` for untrusted pull requests. External contributor workflow runs should require maintainer approval in repository settings.

## Secret scanning expectations

Before any private-to-public visibility change, run a current-tree and full-history secret scan. If real secrets are found, rotate them before publication. If real secrets are present in history, block publication until the history is remediated or a clean public mirror is created.

## Supported versions

Security fixes apply to the current `main` branch unless a separate release branch is explicitly documented.
