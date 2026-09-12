# NextyLeads — Excel Parity Rebuild

NextyLeads adalah internal marketing workspace NextyLabs. Versi ini dirombak mengikuti workbook **Nexty marketing - Social Enriched.xlsx** tetapi UI tidak meniru bentuk spreadsheet.

## Prinsip V2

- Semua data Excel masuk tanpa terkecuali.
- Data operasional dinormalisasi menjadi entity/workflow yang enak dipakai.
- Seluruh 18 sheet juga disimpan sebagai raw snapshot di Firestore `excelSheets` untuk traceability.
- Progress CRM yang sudah berjalan tidak di-reset saat data Excel disinkronkan ulang.
- Single-user workflow, tanpa role/permission layer yang tidak perlu.
- Tidak ada fitur AI.

## Menu

- **Dashboard** — next action, follow-up due, Priority A, social coverage.
- **Leads** — 69 qualified targets; research, score, social media, outreach templates, activity, follow-up.
- **Follow-up** — task D+2 / D+5 otomatis dari aktivitas chat.
- **Research** — 129 Prospect Pool, 88 Research Queue, 69 Social Media profiles, 138 Sources.
- **Templates** — general chat, objection, discovery, conversation flow, offers/pricing, mini audit, proposal.
- **Growth** — Content Plan, 30/60/90 Growth Plan, Partnerships/Reactivation/Referral, Portfolio Proof.
- **Reports** — live funnel, Daily KPI 30D, Weekly Review, Cashflow.
- **Settings** — Firebase setup, full Excel sync, coverage matrix, link ke Data Vault.
- **Data Vault** — audit-only view untuk melihat isi asli seluruh 18 sheet workbook.

## Data coverage

Dataset build ini berisi:

- 18 / 18 Excel sheets mapped
- 12,259 non-empty workbook cells preserved
- 2,105 workbook formulas preserved in snapshot metadata
- 69 qualified leads
- 129 prospect pool
- 88 research-queue records
- 69 social profiles
- 138 research sources
- 30 daily KPI rows
- 345 personalized lead templates (5 × 69 leads)
- all Sales Toolkit / Mini Audit / Weekly Review / Cashflow / Content / Growth / Partnership / Portfolio sections

## WhatsApp automation

Cold outreach tetap human-in-the-loop:

1. Open a lead.
2. Choose one personalized template.
3. Edit/personalize if needed.
4. Click **Buka WhatsApp**; the message is prefilled.
5. Send it in WhatsApp.
6. Return and click **Tandai terkirim**.
7. NextyLeads records the activity, updates stage, and automatically creates D+2/D+5 follow-up tasks.

Direct-send without pressing Send requires the official WhatsApp Business Cloud API and approved templates; it is intentionally not faked in this version.

## Stack

- Next.js 16.2.6
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- date-fns
- lucide-react

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the Firebase web-app config, enable Email/Password Authentication, and create the single marketing user.

Open **Settings → Sinkronkan Excel** once. The sync is idempotent for research/reference data and preserves live lead progress fields for leads that already exist.

## Firestore collections

Core operational collections:

- `leads`
- `leads/{leadId}/activities`
- `tasks`
- `prospects`
- `socialProfiles`
- `researchQueue`
- `dailyKpis`
- `researchSources`

Traceability collections:

- `excelSheets` — one document per Excel sheet containing source range, values, and formulas
- `meta/excel-seed-v2` — import metadata/counts

## Source dataset

The seed files under `src/data/seed/` were generated from `Nexty marketing - Social Enriched.xlsx` on 2026-09-12. `excel-workbook.json` is the exact workbook snapshot used by Data Vault and the Firestore parity layer.
