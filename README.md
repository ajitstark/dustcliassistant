# dev-assistant

AI-powered debugging CLI assistant that analyzes logs, errors, and stack traces; groups failures; suggests fixes and shell commands; and stores searchable debugging memory.

## Quick start

1) Install deps

```bash
pnpm install
pnpm approve-builds
cp .env.example .env
```

2) Start infrastructure

```bash
pnpm docker:up
pnpm prisma:generate
pnpm prisma:migrate
```

3) Run CLI

```bash
pnpm dev -- analyze logs/
pnpm dev -- inspect stacktrace.txt
pnpm dev -- explain "Redis connection timeout"
```

Troubleshooting:
- If Gemini returns 404 for `GEMINI_MODEL`, list available models and pick one that supports `generateContent`:
  - `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"`
  - Set `GEMINI_MODEL=...` in `.env` (or switch with `AI_PROVIDER=openai`).
- If Gemini is flaky (503) or you prefer GitHub credentials, you can use GitHub Models:
  - Set `AI_PROVIDER=github`, `GITHUB_MODELS_TOKEN=...`, `GITHUB_MODELS_MODEL=openai/gpt-4.1` in `.env`.

## Commands

- `dev-assistant analyze <path>`: parse + group errors + AI insights
- `dev-assistant inspect <file>`: stack trace understanding
- `dev-assistant explain <text>`: quick explanation
- `dev-assistant fix <path>`: analyze and propose fixes
- `dev-assistant report <path>`: generate markdown report
- `dev-assistant suggest`: interactive suggestions from memory
- `dev-assistant ask`: semantic memory Q&A
- `dev-assistant live`: stream stdin and analyze in realtime

## Workers (BullMQ)

Run background workers (analysis/report/memory indexing):

```bash
pnpm build
pnpm workers
```

## Config

- `devassistant.config.ts` is supported in dev (via `tsx`).
- For production deployments, prefer `devassistant.config.js` (same shape) to avoid runtime TS loading.
