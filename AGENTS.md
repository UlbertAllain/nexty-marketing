# AGENTS.md

## Purpose

Aturan kerja untuk developer dan coding agent pada NextyLeads.

Baca sebelum coding:
- `ARCHITECTURE.md`
- `ENGINEERING_STANDARD.md`

## Stack

- Next.js 16 + TypeScript
- Firebase Authentication
- Cloud Firestore
- Zod
- date-fns

## Product Constraint

NextyLeads adalah **single-user internal marketing workspace**. Jangan menambahkan role hierarchy, multi-tenant abstraction, atau layer kompleks tanpa kebutuhan nyata.

## Structure

```text
src/
├── app/
├── components/
├── data/
├── features/
└── lib/
```

- `src/app/`: routing dan composition.
- `src/features/`: business/domain capability.
- `src/components/`: reusable presentation.
- `src/lib/`: infrastructure dan shared utility.
- `src/data/seed/`: source dataset parity yang memang digunakan aplikasi.

## Firebase

Client SDK dipakai langsung karena produk single-user dan realtime-heavy.

Perubahan Firestore Rules wajib mempertahankan requirement bahwa hanya authenticated internal operator yang boleh mengakses data.

Jangan membuka collection ke public.

## Verification

```bash
npm run check
```

CI wajib menolak dependency vulnerability level high/critical.
