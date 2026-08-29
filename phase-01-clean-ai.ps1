param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host "[Phase 01] $Message" -ForegroundColor Cyan
}

function Get-ProjectPath([string]$RelativePath) {
    return Join-Path $ProjectRoot $RelativePath
}

function Backup-File([string]$RelativePath, [string]$BackupRoot) {
    $source = Get-ProjectPath $RelativePath
    if (-not (Test-Path -LiteralPath $source)) {
        throw "File wajib tidak ditemukan: $RelativePath"
    }

    $destination = Join-Path $BackupRoot $RelativePath
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path

$requiredFiles = @(
    "package.json",
    ".env.example",
    "README.md",
    "app/globals.css",
    "components/workspace/template-dialog.tsx"
)

foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Get-ProjectPath $relativePath))) {
        throw "ProjectRoot bukan root nexty-marketing yang sesuai. Tidak menemukan: $relativePath"
    }
}

$package = Get-Content -Raw -LiteralPath (Get-ProjectPath "package.json") | ConvertFrom-Json
if ($package.name -ne "nexty-labs-marketing-crm") {
    throw "package.json tidak dikenali. Patch dibatalkan agar tidak mengubah project yang salah."
}

$templatePath = Get-ProjectPath "components/workspace/template-dialog.tsx"
$templateBefore = Get-Content -Raw -LiteralPath $templatePath
if (
    $templateBefore -notmatch '@/lib/ai-template' -and
    $templateBefore -notmatch '/api/ai/generate-template' -and
    $templateBefore -notmatch 'Buat dengan AI'
) {
    Write-Step "Template dialog sudah terlihat bebas AI. Patch tetap melanjutkan cleanup file lain."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Get-ProjectPath ".patch-backups/phase-01-$timestamp"
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

Write-Step "Membuat backup ke .patch-backups/phase-01-$timestamp"
foreach ($relativePath in @(
    ".env.example",
    "README.md",
    "app/globals.css",
    "components/workspace/template-dialog.tsx"
)) {
    Backup-File $relativePath $backupRoot
}

Write-Step "Menghapus generator AI dari TemplateDialog"
$templateDialog = @'
"use client";

import { useState } from "react";
import { Dialog } from "./dialog";
import { saveTemplate } from "@/lib/repository";

const DEFAULT_TEMPLATE = {
  title: "",
  category: "Semua bisnis",
  content: "",
  isDefault: false,
};

export function TemplateDialog({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState(DEFAULT_TEMPLATE);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      await saveTemplate(ownerId, data);
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Pesan belum bisa disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title="Buat pesan siap pakai" onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nama pesan
          <input
            required
            value={data.title}
            onChange={(event) => setData({ ...data, title: event.target.value })}
            placeholder="Contoh: Perkenalan pertama"
          />
        </label>

        <label>
          Cocok untuk usaha
          <input
            value={data.category}
            onChange={(event) =>
              setData({ ...data, category: event.target.value })
            }
            placeholder="Kafe, klinik, atau semua bisnis"
          />
        </label>

        <label className="wide">
          Isi pesan
          <textarea
            rows={10}
            required
            value={data.content}
            onChange={(event) =>
              setData({ ...data, content: event.target.value })
            }
            placeholder="Halo {{contact_name}}, saya ..."
          />
          <small>
            Gunakan {"{{contact_name}}"}, {"{{company_name}}"}, dan {"{{category}}"}
            untuk data yang akan diisi otomatis saat pesan dipakai.
          </small>
        </label>

        <label className="check wide">
          <input
            type="checkbox"
            checked={data.isDefault}
            onChange={(event) =>
              setData({ ...data, isDefault: event.target.checked })
            }
          />
          Gunakan sebagai pilihan utama
        </label>

        {error && <div className="error-box wide">{error}</div>}

        <div className="modal-actions wide">
          <button type="button" className="secondary" onClick={onClose}>
            Batal
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan pesan"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
'@
Set-Content -LiteralPath $templatePath -Value $templateDialog -Encoding utf8

Write-Step "Membersihkan environment variable Gemini"
$envPath = Get-ProjectPath ".env.example"
$envContent = Get-Content -Raw -LiteralPath $envPath
$envContent = [regex]::Replace(
    $envContent,
    '(?m)^\s*#\s*Gemini AI[^\r\n]*\r?\n?',
    ''
)
$envContent = [regex]::Replace(
    $envContent,
    '(?m)^\s*GEMINI_[A-Z0-9_]*\s*=.*\r?\n?',
    ''
)
$envContent = $envContent.TrimEnd() + [Environment]::NewLine
Set-Content -LiteralPath $envPath -Value $envContent -Encoding utf8

Write-Step "Menghapus CSS generator yang sudah tidak dipakai"
$cssPath = Get-ProjectPath "app/globals.css"
$cssContent = Get-Content -Raw -LiteralPath $cssPath
$cssContent = [regex]::Replace(
    $cssContent,
    '\.generator-box\{[^}]*\}\.generator-box>div:first-child\{[^}]*\}\.generator-box>div:first-child span\{[^}]*\}\.generator-box b\{[^}]*\}\.generator-box small\{[^}]*\}\.generator-options\{[^}]*\}\.generator-brief\{[^}]*\}\.generator-box>button\{[^}]*\}\.generator-box button:disabled\{[^}]*\}',
    ''
)
$cssContent = $cssContent.Replace(
    '@media(max-width:650px){.business-links,.generator-options{grid-template-columns:1fr}.generator-brief{grid-column:1}}',
    '@media(max-width:650px){.business-links{grid-template-columns:1fr}}'
)
Set-Content -LiteralPath $cssPath -Value $cssContent -Encoding utf8

Write-Step "Mengganti README lama dengan dokumentasi yang sesuai project saat ini"
$readmePath = Get-ProjectPath "README.md"
$readme = @'
# Nexty Labs Marketing CRM

CRM internal sederhana untuk membantu satu orang marketing mengelola calon klien tanpa membuat workflow lebih rumit daripada Excel.

Aplikasi berfokus pada empat pekerjaan utama:

1. Menyimpan atau mengimpor calon klien.
2. Menyiapkan pesan WhatsApp dari template manual.
3. Mencatat perkembangan lead setelah dihubungi.
4. Membuat dan menyelesaikan pengingat follow-up.

Tidak ada integrasi AI dan tidak ada WhatsApp API. Tombol WhatsApp membuka `wa.me` dengan pesan yang sudah terisi; pengiriman tetap dilakukan langsung oleh pengguna di WhatsApp.

## Stack

- Next.js 16
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS 4
- Lucide React

## Setup

Gunakan Node.js 22 atau lebih baru.

```bash
npm install
```

Salin environment example:

```bash
cp .env.example .env.local
```

Isi konfigurasi Firebase di `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Aktifkan Firebase Authentication dengan provider Email/Password dan buat akun marketing yang akan menggunakan aplikasi.

## Development

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Business flow

```text
Lead masuk
  -> pilih/tulis template
  -> buka WhatsApp
  -> kirim pesan di WhatsApp
  -> kembali ke CRM
  -> tandai sudah dikirim
  -> follow-up bila diperlukan
  -> perbarui status lead
```

Template mendukung placeholder berikut:

- `{{contact_name}}`
- `{{company_name}}`
- `{{category}}`

Placeholder tersebut hanya merupakan text templating lokal dan tidak terhubung ke layanan AI.

## Struktur utama

```text
app/                    Route dan global styling
components/             UI dan workspace components
components/workspace/   Dashboard, leads, follow-up, template, dialog
lib/business.ts         Business rules dan helper murni
lib/repository.ts       Operasi Cloud Firestore
lib/spreadsheet-import.ts Parser import spreadsheet
lib/types.ts            Domain types
tests/                  Unit tests
```

## Catatan desain

Project ini sengaja ditujukan untuk satu pengguna marketing. `ownerId` tetap disimpan pada data untuk memastikan query dan Firestore Security Rules hanya mengakses data milik akun yang sedang login. Tidak diperlukan workspace, role, assignment, atau sistem multi-user selama kebutuhan bisnis masih satu pengguna.
'@
Set-Content -LiteralPath $readmePath -Value $readme -Encoding utf8

Write-Step "Menjalankan post-check"
$scanTargets = @(
    (Get-ProjectPath ".env.example"),
    (Get-ProjectPath "README.md"),
    (Get-ProjectPath "app/globals.css"),
    (Get-ProjectPath "components/workspace/template-dialog.tsx")
)

$forbiddenPatterns = @(
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    '@/lib/ai-template',
    '/api/ai/generate-template',
    'Buat dengan AI',
    'Sparkles',
    'generator-box',
    'generator-options',
    'generator-brief'
)

$violations = @()
foreach ($file in $scanTargets) {
    $content = Get-Content -Raw -LiteralPath $file
    foreach ($pattern in $forbiddenPatterns) {
        if ($content.Contains($pattern)) {
            $violations += "$(Split-Path -Leaf $file): $pattern"
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host "Patch selesai tetapi post-check menemukan sisa berikut:" -ForegroundColor Yellow
    $violations | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    Write-Host "Backup tersedia di: $backupRoot" -ForegroundColor Yellow
    exit 2
}

Write-Host ""
Write-Host "Phase 01 selesai: integrasi AI sudah dibersihkan." -ForegroundColor Green
Write-Host "Backup : $backupRoot" -ForegroundColor DarkGray
Write-Host "Next   : npm run lint; npm test; npm run build" -ForegroundColor DarkGray
