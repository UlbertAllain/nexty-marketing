# AGENTS.md

## Purpose

Dokumen ini adalah aturan kerja wajib untuk AI/developer pada project.

Source of truth utama:
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ENGINEERING_STANDARD.md`

Jangan mengubah architecture, naming, atau pola kerja tanpa alasan yang jelas.

## Mandatory Tech Stack

Default stack:
- Next.js
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Cloudinary hanya jika project membutuhkan image handling

Jangan mengganti stack utama tanpa instruksi eksplisit.

## Engineering Goal

Semua project harus:
- clean
- structured
- predictable
- maintainable
- secure
- testable
- modular
- scalable seperlunya
- mudah dipahami developer lain

Prioritaskan solusi yang sederhana tetapi benar. Hindari overengineering.

## Before Coding

Sebelum menulis kode:
1. Baca `docs/ARCHITECTURE.md`.
2. Baca `docs/ENGINEERING_STANDARD.md`.
3. Pahami requirement dan business rule.
4. Tentukan system/data flow.
5. Tentukan Firebase impact.
6. Tentukan authentication/authorization.
7. Tentukan module yang terdampak.
8. Tentukan edge case dan security concern.
9. List file yang dibuat/diubah/dihapus.
10. Baru implementasi.

## Default Request Flow

```text
Page / Client
↓
Validation / Application boundary
↓
Service
↓
Repository
↓
Firebase
```

## Responsibility Rules

- `app/` hanya routing, page, layout, loading, error boundary, dan framework concern.
- `modules/` untuk business/domain.
- `components/ui/` untuk generic UI.
- `components/` untuk reusable application UI.
- `lib/` untuk Firebase dan external integration.
- Jangan menaruh core business logic di page/component.
- Jangan membuat layer/folder tanpa responsibility yang jelas.

## Firebase Rules

Preferred:

```text
Service
↓
Repository
↓
Firestore
```

Direct client access hanya boleh jika Security Rules aman dan business rule tidak bisa dibypass.

## Security

Selalu review authentication, authorization, Firestore Security Rules, input validation, XSS, environment variables, dan sensitive data exposure.
