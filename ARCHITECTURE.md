# ARCHITECTURE.md

## Overview

NextyLeads adalah single-user internal CRM/marketing workspace berbasis Next.js dan Firebase.

Arsitektur sengaja sederhana:

```text
UI / Page
↓
Feature Hook / Repository
↓
Firebase Client SDK
↓
Authenticated Firestore
```

Tidak ada role hierarchy atau multi-tenant boundary karena hanya satu operator internal.

## Structure

```text
src/
├── app/
│   ├── (app)/
│   └── login/
├── components/
│   └── ui/
├── data/
│   └── seed/
├── features/
│   ├── auth/
│   ├── leads/
│   ├── messages/
│   ├── settings/
│   └── tasks/
└── lib/
    ├── firebase/
    └── utils/
```

## Seed Data

`src/data/seed/` bukan artifact sementara. File-file tersebut adalah snapshot dataset yang dipakai untuk parity dengan workbook marketing dan Data Vault.

Jangan memindahkan atau menghapus seed besar hanya karena ukurannya.

## Design Rule

Gunakan solusi paling sederhana yang tetap maintainable. Hindari:
- service/repository wrapper tanpa fungsi nyata;
- role/permission layer yang tidak dibutuhkan;
- abstraction untuk kemungkinan multi-user yang belum ada.

## Security Boundary

Firestore saat ini dibatasi ke authenticated user. Karena sistem single-user, akun Firebase Authentication harus tetap dikontrol ketat dan tidak boleh dibuat untuk pihak eksternal.
