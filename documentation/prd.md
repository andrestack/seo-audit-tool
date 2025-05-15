# 1. Product Requirements Document (PRD)

## 1.1 Product Vision

Create a web‑based **SEO Audit Assistant** that visualises technical/content metrics for any website and, on demand, leverages an LLM to generate concrete improvement suggestions that the consultant can manually apply. The app replaces costly SaaS tools with an in‑house, data‑driven workflow.

## 1.2 Goals & Success Metrics

| Goal                              | KPI                                  |
| --------------------------------- | ------------------------------------ |
| Reduce audit time                 | < 5 min per site (was 30 min)        |
| Produce actionable AI suggestions | ≥ 90 % accepted by consultant        |
| Improve client ranking            | Top‑10 SERP movement within 3 months |
| Lower tooling cost                | Save ≥ 80 % vs current SaaS spend    |

## 1.3 Target Users

* **SEO Consultant / You** – power user executing audits, approving AI output.
* **SMB Client (Read‑only)** – views interactive report link.

## 1.4 Core Features

1. **Dashboard** – list of audits, status badges, run new audit.
2. **Metrics Visualisation** – charts/cards for:

   * Broken links count
   * Missing ALTs
   * Heavy requests (by type/domain)
   * Heading issues
   * Meta length compliance
   * Top keyword frequency
3. **AI Improvement Panel**

   * Per metric **“Improve with AI”** button
   * Shows LLM suggestions (titles, metas, alt text, heading fixes, perf tips)
   * Accept / reject UI, export to clipboard or JSON
4. **Competitor Comparison** – overlay client vs competitor metrics/keywords.
5. **Audit Storage** – persist results (SQLite ‑> Postgres later) for versioning.
6. **Auth & Roles** – Next‑Auth (consultant vs client read‑only links).
7. **Reports** – one‑click PDF/HTML export.

## 1.5 Non‑Functional Requirements

* **Performance** – TTFB < 200 ms for dashboard, charts rendered < 1 s.
* **Security** – OWASP Top‑10 hardening, server‑side secrets, rate limiting.
* **Scalability** – modular, stateless API routes deployable on Vercel.
* **Extensibility** – plug‑in new metrics (e.g., Core Web Vitals) easily.

## 1.6 Tech Stack

* **Frontend** – Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui, Recharts.
* **Backend** – Next.js API routes (Edge‑ready); Node.js utility scripts integrated as workers.
* **LLM** – OpenAI GPT‑4o via server‑side route.
* **DB** – SQLite (local) → Postgres in production (Prisma ORM).
* **Auth** – next‑auth with GitHub/Google + magic links.
* **CI/CD** – GitHub Actions → Vercel.

## 1.7 Architecture Overview

```
Browser ─┬─► Next.js React UI ► API /audit  ─► Worker (scripts) ─► DB
         │                                │
         └─► AI Panel ► API /ai‑suggest ───┘─► OpenAI
```

## 1.8 Risks & Mitigations

| Risk                      | Mitigation                                                   |
| ------------------------- | ------------------------------------------------------------ |
| LLM hallucinations        | Display diff + require human approval                        |
| Puppeteer heavy on Vercel | Use on‑demand Edge/Serverless function with up‑to‑512 MB RAM |
| Rate‑limited target sites | Throttle & cache results                                     |

---

