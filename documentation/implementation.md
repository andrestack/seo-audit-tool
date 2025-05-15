# 2. 50‑Step Implementation Plan

### Phase 0 – Project Setup

1. **Create repo** `seo-audit-assistant` on GitHub.
2. Scaffold with `create-next-app@latest –‑typescript`.
3. Add Tailwind & shadcn/ui (`npx shadcn-ui@latest init`).
4. Create `/scripts` folder; copy existing Node audit utilities.
5. Initialise Prisma; configure SQLite dev DB.
6. Install deps: `axios`, `cheerio`, `puppeteer`, `openai`, `recharts`, `clsx`, `next-auth`, `zod`.
7. Add ESLint + Prettier config.

### Phase 1 – Backend API & Workers

8. Create `lib/runAudit.ts` to orchestrate script calls.
9. Wrap each script in a Promisified fn (import from `/scripts`).
10. Add `/api/audit` POST route: accepts `{ url, competitors? }`.
11. Spawn worker thread (or Edge Function) to run `runAudit`.
12. Persist raw JSON to `Audit` table via Prisma.
13. Return job status + ID.
14. Add `/api/audit/[id]` GET route for polling.
15. Seed DB with sample audit for dev.

### Phase 2 – LLM Integration

16. Create `/lib/ai.ts` wrapper (OpenAI SDK).
17. Design prompt templates per metric (system + user roles).
18. Add `/api/ai-suggest` POST route `{ auditId, metric }`.
19. Fetch audit JSON, feed into prompt, stream results.
20. Store suggestions in `Suggestion` table linked to metric.

### Phase 3 – Auth & User Model

21. Configure next‑auth with GitHub provider & email magic link.
22. Add `User`, `Audit`, `Suggestion` relations in Prisma.
23. Implement role enum (`CONSULTANT`, `CLIENT`).
24. Protect API routes & pages with session checks.

### Phase 4 – UI Skeleton

25. Create `app/(dashboard)/layout.tsx` with sidebar.
26. Page `/dashboard` lists audits (SSR fetch).
27. Page `/audit/[id]` shows metric cards (broken links, etc.).
28. Build `MetricCard` component with status colour & chart.
29. Integrate Recharts Bar/Pie for each metric dataset.
30. Add "Improve with AI" button → calls `/api/ai-suggest`.
31. Modal displays streamed suggestion text + Accept/Reject.
32. Accept ⇒ save to `AcceptedSuggestion` table and copy to clipboard.

### Phase 5 – Competitor Comparison

33. Extend audit POST body to include competitor URLs array.
34. For each competitor, run same scripts; tag results.
35. In UI, toggle competitor overlay on metric charts.
36. Add "Keyword Gap" table (client vs competitor top terms).

### Phase 6 – Reporting & Export

37. Create `/api/report/pdf` – uses `puppeteer-core` to render page → PDF.
38. Add "Download PDF" button on audit page.
39. HTML report uses same React components, server‑rendered.

### Phase 7 – Performance & Caching

40. Memoise script results for same URL within 24 h (KV cache).
41. Lazy‑load heavy charts via dynamic imports.
42. Add loading skeletons (shadcn/ui `Skeleton`).

### Phase 8 – Testing & QA

43. Unit tests for scripts with Jest.
44. API route tests with Supertest.
45. E2E tests with Cypress (run audit flow).<|vq\_6491|
