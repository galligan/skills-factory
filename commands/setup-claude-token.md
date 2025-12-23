---
description: Generate a Claude OAuth token and store it as a GitHub Actions secret
---

# Setup Claude OAuth Token

## What this does

- Generates a Claude Code OAuth token
- Stores it as `CLAUDE_CODE_OAUTH_TOKEN` in your repo secrets

## Steps

1) Generate a token:

```bash
claude setup-token
```

1) Store it in GitHub Secrets for this repo:

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN -R owner/repo
```

Paste the token when prompted.

### Optional: Org-level secret

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --org my-org
```
