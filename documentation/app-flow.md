# App Flow – SEO Audit Assistant (v1.1 – PageSpeed Insights Added)

> **Purpose**: Provide a concise, developer‑friendly overview of how a user (consultant or client) moves through the application, which services are called, and where data is persisted.

---

## 1. High‑Level Flow Diagram (textual)

```
Visitor ─► /login ─► Dashboard ─► New Audit Modal ─► /api/audit (POST)
                                                     │
                                                     ▼
                                          Worker (runAudit.ts)
                                                     │  ┌─ calls Google PSI REST → performanceJSON
                                                     │  ▼
                             Prisma DB ◄── store raw JSON  ───►  Poll /api/audit/[id]
                                                     │
                                                     ▼
                               Dashboard updates status via SWR
                                                     │
                                                     ▼
Audit Detail Page ─► View metric cards ─► Click “Improve with AI”
                                                     │
                                                     ▼
                                          /api/ai‑suggest (POST)
                                                     │
                                                     ▼
                               Stream LLM suggestions → Modal
                                                     │
                                                     ▼
                             Accept = save suggestion (DB)
                                                     │
                                                     ▼
                             Copy / Export / Apply manually
```

---

## 2. Actor Journeys

| Actor                  | Primary Screens                                            | Key Actions                                                                                             |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Consultant**         | Login → Dashboard → Audit Detail → AI Suggestions → Export | Run audits, review metrics (incl. PageSpeed), trigger AI improvements, export PDF, share read‑only link |
| **Client (read‑only)** | Shared Audit Link                                          | View metrics + accepted AI recommendations, download PDF                                                |

---

## 3. Detailed Step‑by‑Step Flow

### 3.1 Onboarding & Auth

1. **User lands on `/login`.**
2. Auth via GitHub/Google OAuth (next‑auth) OR magic link.
3. On success, redirect to `/dashboard`.

### 3.2 Run New Audit

4. User clicks **“New Audit”.**
5. Modal collects:

   * Target URL
   * Competitor URLs (optional)
6. Frontend `POST /api/audit` `{ url, competitors[] }`.
7. API enqueues **worker thread** → `runAudit.ts`.
8. Worker executes scripts **plus** calls the **Google PageSpeed Insights REST API** (`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile|desktop`).
9. Parses LCP, FID (or INP), CLS, TTFB, overall performance score.
10. Stores metrics in `Audit` → `Metric` rows, status = DONE.
11. API returns `{ jobId }`; dashboard polls `/api/audit/[jobId]`.

### 3.3 Viewing Audit Details

12. User opens `/audit/[id]`.
13. Server fetches audit JSON; child charts render:

    * Broken Links
    * Missing ALT
    * Heavy Requests
    * Heading Issues
    * **PageSpeed Card** (Performance score + bar chart of LCP / INP / CLS)
14. Each card has **Improve with AI** where relevant (PageSpeed shows “Optimise Assets” suggestion generation).

### 3.4 AI Improvement Workflow

15–22. *(unchanged – same as previous version)*

### 3.5 Report Export & Share Link

23–30. *(unchanged – now includes PageSpeed section in PDF)*

---

## 4. Folder Structure (Next.js App Router)

```
seo-audit-assistant/
└─ app/
   └─ api/
      ├── audit/route.ts       # Creates worker job
      ├── audit/[id]/route.ts  # Poll status
      ├── ai-suggest/route.ts
      ├── report/pdf/route.ts
      └── pagespeed/route.ts   # (optional) proxy PSI if rate-limited
└─ lib/
   ├── runAudit.ts        # + fetchPageSpeed(url)
   ├── ai.ts
   └── prisma.ts
└─ scripts/               # Node audit utilities
```

---

## 5. Data Models (Prisma additions)

Add new metric key constant: `PAGE_SPEED`.

```prisma
model Metric {
  id        String   @id @default(cuid())
  auditId   String
  key       String   // e.g., BROKEN_LINKS | PAGE_SPEED
  json      Json
  Audit     Audit    @relation(fields: [auditId], references: [id])
}
```

Stored `json` for `PAGE_SPEED` example:

```json
{
  "score": 0.72,
  "lcp": 2.5,
  "inp": 180,
  "cls": 0.08,
  "ttfb": 0.25,
  "device": "mobile"
}
```

---

## 6. Metric Visualisation Guidelines

| Metric          | Chart                          | Severity Logic                    |
| --------------- | ------------------------------ | --------------------------------- |
| PageSpeed Score | Gauge / radial bar             | Green ≥0.9, Orange ≥0.5, Red <0.5 |
| LCP / INP / CLS | Bar chart vs Google thresholds | Use threshold overlays            |

---

## 7. API Quota & Secrets

* Obtain free **PageSpeed Insights API key** → store in `.env` as `PSI_KEY`.
* Each audit triggers **2 calls** (mobile & desktop) ≈ 160 s quota per 100 requests.

---

## 8. Future Enhancements

* Batch PSI requests via Google Cloud to raise quota.
* Correlate heavy requests list with PSI diagnostics for asset‑level fixes.
* Add field‑data (CrUX) when available.
