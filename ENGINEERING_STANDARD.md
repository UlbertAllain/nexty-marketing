# ENGINEERING_STANDARD.md

## Principles

Clean Code, Separation of Concerns, SRP, DRY, KISS, YAGNI, strict TypeScript, runtime validation, dan minimum necessary abstraction.

## UI

Client component fokus pada interaction/presentation. Extract komponen jika responsibility memang terpisah, bukan hanya karena jumlah baris.

## Firebase

- Authentication wajib sebelum data access.
- Public Firestore access dilarang.
- Mutation penting harus tetap punya data validation/normalization yang jelas.
- Jangan menambah Admin SDK/backend layer tanpa alasan bisnis/security yang konkret.

## Seed Data

Dataset parity di `src/data/seed/` adalah source data aplikasi dan harus diperlakukan sebagai versioned asset.

## Quality Gate

```bash
npm run check
```

CI menggunakan deterministic install dan memblokir high/critical dependency vulnerability.
