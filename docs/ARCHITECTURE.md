# Architecture — NextyLeads Excel Parity Rebuild

## Product rule

The app follows the **workflow**, not the workbook tab layout. Excel remains the source dataset for this rebuild, but users should not feel like they are operating a spreadsheet in a browser.

## Main navigation

1. Dashboard
2. Leads
3. Follow-up
4. Research
5. Templates
6. Growth
7. Reports
8. Settings

`Data Vault` is intentionally not placed in the main sidebar. It is an audit/traceability route opened from Settings.

## Data architecture

### Operational / normalized data

`leads/{leadId}`
- identity + business profile
- opportunity scoring
- research evidence
- recommended offer / solution concept
- social profile
- five personalized outreach templates
- current CRM stage and next action

`leads/{leadId}/activities/{activityId}`
- sent message
- stage changes
- meeting / proposal / note events

`tasks/{taskId}`
- D+2 / D+5 / manual follow-up tasks

`prospects/{prospectId}`
- 129-prospect pool

`socialProfiles/{leadId}`
- Instagram, TikTok, Facebook, LinkedIn, website, link-in-bio
- verification status/source/date

`researchQueue/{id}`
- 88 research queue records

`researchSources/{id}`
- 138 source/evidence rows

`dailyKpis/{id}`
- 30-day KPI plan imported from Excel

### Exact Excel parity layer

`excelSheets/{sheetId}`

One Firestore document per Excel sheet:
- original sheet name
- source range
- full values matrix
- formula cell metadata
- import timestamp

This layer guarantees that no workbook cell is silently discarded just because the current application model does not need it as a first-class field.

## UI mapping

- Dashboard consumes Priority Queue and live CRM data.
- Lead detail combines Targets + Outreach + Follow-up + Social Media + Sources.
- Research combines Prospect Pool + Research Queue + Social Media + Sources.
- Templates combines Mini Audit + Sales Toolkit + personalized outreach.
- Growth combines Content Plan + Growth Plan + Partnerships/Reactivation/Referral + Portfolio Proof.
- Reports combines live funnel + Daily KPI + Weekly Review + Cashflow.
- Data Vault exposes the raw workbook snapshot for audit only.

## Chat automation

First outreach:
1. User reviews the personalized template.
2. `Buka WhatsApp` opens click-to-chat with the message prefilled.
3. User presses Send in WhatsApp.
4. User clicks `Tandai terkirim` in NextyLeads.
5. System records activity, moves stage to Contacted, and creates D+2.

D+2:
- marks D+2 done;
- creates D+5;
- updates next action/date.

D+5:
- closes cold follow-up sequence;
- no further cold task is created.

Direct programmatic WhatsApp send is intentionally excluded until the official WhatsApp Business Cloud API and approved-message requirements are configured.

## Excel sync safety

Re-syncing Excel enrichment must not overwrite live CRM progress.

For an existing lead, sync updates research, scoring, templates, social profile, evidence, sources, etc., but preserves dynamic fields such as:
- stage
- nextAction
- notes
- firstContactAt
- lastContactAt
- nextFollowUpAt

## Security

- Firebase Email/Password Auth.
- No public sign-up.
- Firestore requires authenticated requests.
- Current scope assumes one internal marketing account.
