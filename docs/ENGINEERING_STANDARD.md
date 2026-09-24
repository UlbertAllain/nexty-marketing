# ENGINEERING_STANDARD.md

## Core Principles

Gunakan:
- Clean Code
- Separation of Concerns
- Single Responsibility
- DRY
- KISS
- YAGNI
- Modular Architecture
- Consistent Naming
- Validation
- Error Handling
- Security
- Testing

Jangan overengineering. Pilih solusi paling sederhana yang tetap benar, aman, dan maintainable.

## Code Structure

Code harus mudah dibaca, mudah diprediksi, memiliki responsibility jelas, minim coupling, business logic tidak bercampur dengan UI, dan persistence tidak tersebar.

## TypeScript

Gunakan strict TypeScript. Prefer explicit domain types, `unknown` daripada `any`, type narrowing, dan module-local type jika hanya dipakai satu module.

## Service Rule

Service adalah tempat utama business logic. Business rule jangan disebar di page/component.

## Repository Rule

Repository bertanggung jawab terhadap persistence dan tidak menentukan business decision.

## Validation

Semua external input harus divalidasi: form, request body, route param, query param, uploaded file, environment variable, dan external API response jika relevan.

TypeScript bukan runtime validation.

## Firebase

Gunakan Firebase Authentication untuk auth dan Cloud Firestore untuk data. Firebase Admin hanya di trusted server-side environment.

Review Security Rules, query count, Firestore cost, index, transaction, ownership, concurrent update, dan hindari unnecessary reads.

## Error Handling

Gunakan error meaningful dan jangan expose stack trace/internal database error ke client.

## Security Baseline

Review:
- authentication
- authorization
- Firestore Security Rules
- validation
- XSS
- CORS
- CSRF jika relevan
- rate limiting
- upload security
- secret management
- dependency vulnerabilities

Jangan hardcode secret, token, private credential, atau service-account key.
