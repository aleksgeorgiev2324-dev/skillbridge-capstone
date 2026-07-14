# GitHub Upload

Repository:

```text
https://github.com/aleksgeorgiev2324-dev/skillbridge-capstone
```

## Current Blocker

Codex can read repository metadata, but GitHub currently returns:

```text
403 Resource not accessible by integration
```

This means the Codex/OpenAI GitHub App does not have repository contents write access yet.

## Option A: Give Codex Connector Write Access

1. Open GitHub.
2. Go to **Settings**.
3. Open **Applications**.
4. Open **Installed GitHub Apps**.
5. Find the OpenAI / Codex / ChatGPT GitHub app.
6. Click **Configure**.
7. Allow access to `skillbridge-capstone`.
8. Make sure repository contents write access is enabled.
9. Return to Codex and ask it to retry the upload.

## Option B: Upload with GitHub Desktop

1. Install GitHub Desktop.
2. Clone `aleksgeorgiev2324-dev/skillbridge-capstone`.
3. Copy all files from this project folder into the cloned repository.
4. Do not copy:
   - `node_modules`
   - `dist`
   - `.npm-cache`
   - `.env`
5. Commit and push.

## Option C: Upload with Git CLI

After installing Git, run from this project folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/aleksgeorgiev2324-dev/skillbridge-capstone.git
git add .github .gitignore .env.example docs index.html netlify.toml package.json package-lock.json pages scripts src supabase vite.config.js README.md
git commit -m "docs: add project README and setup guides"
git push -u origin main
```

Then continue with the commit plan in `docs/COMMIT_PLAN.md`.

## Important

The capstone requirement asks for at least 15 commits on at least 3 different days. Do not make all commits in one day if you want full points for commit days.
