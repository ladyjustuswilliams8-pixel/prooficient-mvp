# Prooficient MVP

Prooficient is an AI output verification app. The first functional version lets a user paste AI-generated content, analyze it, extract factual claims, assign a ProofScore™, and return a verification-style report.

## What this MVP does

- Paste AI-generated output
- Extract factual claims
- Score trustworthiness using ProofScore™
- Flag unsupported or weak claims
- Generate a founder-demo-ready verification report
- Works in demo mode without an API key
- Uses the OpenAI API when `OPENAI_API_KEY` is added

## Quick Start

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Add OpenAI API Key

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

Then restart:

```bash
npm run dev
```

## Deploy

Recommended deployment:

- Vercel for frontend/backend
- Supabase later for users/reports
- Stripe later for payments

## MVP Scope

This is Version 1:

Paste → Analyze → ProofScore™ Report

Not included yet:

- Login
- Database
- Billing
- Saved reports
- Team dashboard
- Full source crawling
- Human reviewer workflow

Those are Version 2.
