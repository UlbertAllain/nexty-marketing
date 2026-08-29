# Nexty Marketing - Phase 03B: Encoding + Source Sanity Fix
# Safe to run after Phase 03, including when Phase 04 already wrote its UI files.
# This script is intentionally ASCII-only for Windows PowerShell 5.1 compatibility.

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ProjectRoot (".patch-backups\\phase-03b-encoding-" + $Timestamp)
$Utf8 = [System.Text.Encoding]::UTF8
$Cp1252 = [System.Text.Encoding]::GetEncoding(1252)

function Project-Path([string]$RelativePath) {
    return Join-Path $ProjectRoot $RelativePath
}

function Read-Utf8([string]$Path) {
    try {
        return [System.IO.File]::ReadAllText($Path, $Utf8)
    }
    catch {
        # Fallback for a text file that Windows PowerShell previously rewrote.
        return [System.IO.File]::ReadAllText($Path)
    }
}

function Backup-Path([string]$Path) {
    $RelativePath = $Path.Substring($ProjectRoot.Length).TrimStart([char]0x5C, [char]0x2F)
    $Destination = Join-Path $BackupRoot $RelativePath
    $DestinationDirectory = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Force -Path $DestinationDirectory | Out-Null
    Copy-Item -LiteralPath $Path -Destination $Destination -Force
}

function Contains-SuspiciousMojibake([string]$Text) {
    return (
        $Text.IndexOf([char]0x00C2) -ge 0 -or
        $Text.IndexOf([char]0x00C3) -ge 0 -or
        $Text.IndexOf([char]0x00E2) -ge 0 -or
        $Text.IndexOf([char]0xFFFD) -ge 0
    )
}

function Repair-MojibakeLine([string]$Line) {
    if (-not (Contains-SuspiciousMojibake $Line)) {
        return $Line
    }

    try {
        $Bytes = $Cp1252.GetBytes($Line)
        $Candidate = $Utf8.GetString($Bytes)
        if (-not (Contains-SuspiciousMojibake $Candidate)) {
            return $Candidate
        }
    }
    catch {
        # Fall through to explicit replacements below.
    }

    return $Line
}

function Normalize-UiText([string]$Text) {
    # First reverse common UTF-8-as-CP1252 mojibake line by line.
    $Lines = [regex]::Split($Text, "`r?`n")
    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        $Lines[$Index] = Repair-MojibakeLine $Lines[$Index]
    }
    $Result = [string]::Join("`n", $Lines)

    # Then make punctuation literals ASCII-safe so this cannot recur.
    $Result = $Result.Replace([string][char]0x00B7, " / ")
    $Result = $Result.Replace([string][char]0x2026, "...")
    $Result = $Result.Replace([string][char]0x2014, "-")
    $Result = $Result.Replace([string][char]0x2013, "-")
    $Result = $Result.Replace([string][char]0x201C, [string][char]0x0022)
    $Result = $Result.Replace([string][char]0x201D, [string][char]0x0022)
    $Result = $Result.Replace([string][char]0x25CB, "o")
    $Result = $Result.Replace([string][char]0x2192, "->")

    return $Result
}

$PackagePath = Project-Path "package.json"
if (-not (Test-Path -LiteralPath $PackagePath)) {
    throw "Jalankan script dari root project nexty-marketing."
}

$Package = [System.IO.File]::ReadAllText($PackagePath, $Utf8) | ConvertFrom-Json
if ($Package.name -ne "nexty-labs-marketing-crm") {
    throw "package.json tidak dikenali. Patch dibatalkan."
}

$RequiredPhase3File = Project-Path "components/workspace/leads-view.tsx"
if (-not (Test-Path -LiteralPath $RequiredPhase3File)) {
    throw "leads-view.tsx tidak ditemukan."
}
$Phase3Probe = Read-Utf8 $RequiredPhase3File
if (-not $Phase3Probe.Contains("websiteUrl")) {
    throw "Phase 03 belum terdeteksi. Jalankan Phase 03 terlebih dahulu."
}

Write-Host ""
Write-Host "Nexty Marketing - Phase 03B / Encoding + Source Sanity" -ForegroundColor DarkYellow
Write-Host ("Project: {0}" -f $ProjectRoot)
Write-Host ""

$SourceRoots = @("app", "components", "lib", "tests")
$Extensions = @(".ts", ".tsx", ".css", ".js", ".jsx")
$Files = @()
foreach ($RootName in $SourceRoots) {
    $RootPath = Project-Path $RootName
    if (Test-Path -LiteralPath $RootPath) {
        $Files += Get-ChildItem -LiteralPath $RootPath -Recurse -File | Where-Object {
            $Extensions -contains $_.Extension.ToLowerInvariant()
        }
    }
}

$Changed = New-Object System.Collections.Generic.List[string]
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

foreach ($File in $Files) {
    $Before = Read-Utf8 $File.FullName
    $After = Normalize-UiText $Before

    if ($After -ne $Before) {
        Backup-Path $File.FullName
        [System.IO.File]::WriteAllText($File.FullName, $After, $Utf8)
        $Relative = $File.FullName.Substring($ProjectRoot.Length).TrimStart([char]0x5C, [char]0x2F)
        $Changed.Add($Relative)
    }
}

# Also remove obsolete Gemini env variables if an old .env.example survived Phase 01.
$EnvExample = Project-Path ".env.example"
if (Test-Path -LiteralPath $EnvExample) {
    $EnvBefore = Read-Utf8 $EnvExample
    $EnvAfter = [regex]::Replace($EnvBefore, '(?m)^\s*#\s*Gemini AI[^\r\n]*\r?\n?', '')
    $EnvAfter = [regex]::Replace($EnvAfter, '(?m)^\s*GEMINI_[A-Z0-9_]*\s*=.*\r?\n?', '')
    if ($EnvAfter -ne $EnvBefore) {
        Backup-Path $EnvExample
        [System.IO.File]::WriteAllText($EnvExample, $EnvAfter, $Utf8)
        $Changed.Add(".env.example")
    }
}

Write-Host "Menjalankan source sanity check..." -ForegroundColor Cyan

$SuspiciousFiles = New-Object System.Collections.Generic.List[string]
foreach ($File in $Files) {
    $Content = Read-Utf8 $File.FullName
    if (Contains-SuspiciousMojibake $Content) {
        $Relative = $File.FullName.Substring($ProjectRoot.Length).TrimStart([char]0x5C, [char]0x2F)
        $SuspiciousFiles.Add($Relative)
    }
}

if ($SuspiciousFiles.Count -gt 0) {
    Write-Host "Masih ada karakter encoding mencurigakan di:" -ForegroundColor Red
    $SuspiciousFiles | ForEach-Object { Write-Host ("  - {0}" -f $_) -ForegroundColor Red }
    throw "Encoding sanity check gagal. Backup tersedia di $BackupRoot"
}

# Runtime AI check only. Documentation and patch scripts are not runtime dependencies.
$RuntimeAiNeedles = @(
    "@/lib/ai-template",
    "/api/ai/generate-template"
)
$RuntimeAiFound = New-Object System.Collections.Generic.List[string]
foreach ($Needle in $RuntimeAiNeedles) {
    foreach ($File in $Files) {
        $Content = Read-Utf8 $File.FullName
        if ($Content.Contains($Needle)) {
            $Relative = $File.FullName.Substring($ProjectRoot.Length).TrimStart([char]0x5C, [char]0x2F)
            $RuntimeAiFound.Add(("{0} -> {1}" -f $Relative, $Needle))
        }
    }
}
if ($RuntimeAiFound.Count -gt 0) {
    Write-Host "Referensi AI runtime masih ditemukan:" -ForegroundColor Red
    $RuntimeAiFound | Sort-Object -Unique | ForEach-Object { Write-Host ("  - {0}" -f $_) -ForegroundColor Red }
    throw "Runtime AI cleanup belum bersih."
}

Write-Host ""
Write-Host "Phase 03B berhasil." -ForegroundColor Green
if ($Changed.Count -eq 0) {
    Write-Host "Tidak ada source yang perlu diperbaiki; project sudah bersih." -ForegroundColor DarkGray
}
else {
    Write-Host ("File diperbaiki: {0}" -f $Changed.Count) -ForegroundColor Yellow
    $Changed | Sort-Object -Unique | ForEach-Object { Write-Host ("  - {0}" -f $_) }
    Write-Host ("Backup: {0}" -f $BackupRoot) -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Berikutnya jalankan phase-04-warm-orange-ui-v2.ps1" -ForegroundColor Yellow
Write-Host ""
