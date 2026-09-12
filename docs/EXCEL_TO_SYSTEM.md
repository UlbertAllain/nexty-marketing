# Excel → NextyLeads mapping

The workbook is not converted into 18 sidebar menus. Each sheet has a functional destination, while a raw copy remains available through Data Vault and `excelSheets`.

| Excel sheet | System destination |
|---|---|
| 00 START HERE | Dashboard + Data Vault |
| 01 Priority Queue | Dashboard / Leads |
| 02 Targets | Leads |
| 03 Outreach | Lead detail personalized templates |
| 04 Follow-up | Follow-up tasks / lead pipeline |
| 05 Mini Audit | Templates → Mini Audit |
| 06 Sales Toolkit | Templates |
| 07 Prospect Pool | Research → Prospect Pool |
| 08 Research Queue | Research → Research Queue |
| 09 Daily KPI | Reports → Daily KPI |
| 10 Weekly Review | Reports → Weekly Review |
| 11 Cashflow | Reports → Cashflow |
| 12 Content Plan | Growth → Content |
| 13 Growth Plan | Growth → Growth Plan |
| 14 Partnerships | Growth → Partnerships |
| 15 Portfolio Proof | Growth → Portfolio Proof |
| 16 Sources | Research → Sources + lead evidence |
| 17 Social Media | Lead detail + Research → Social Media |

## No-data-loss rule

Every functional area uses normalized data where useful, but the raw sheet payload is also stored in `excelSheets`. This prevents the application model from dropping spreadsheet cells that are not yet part of an interactive feature.
