# Nexty Marketing - Phase 03C: Regex Repair
# Repairs the regex damaged by Phase 03B punctuation normalization.
# ASCII-only for Windows PowerShell 5.1 compatibility.

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ProjectRoot (".patch-backups\\phase-03c-regex-" + $Timestamp)
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Project-Path([string]$RelativePath) {
    return Join-Path $ProjectRoot $RelativePath
}

$PackagePath = Project-Path "package.json"
if (-not (Test-Path -LiteralPath $PackagePath)) {
    throw "Jalankan script dari root project nexty-marketing."
}

$Package = [System.IO.File]::ReadAllText($PackagePath, $Utf8) | ConvertFrom-Json
if ($Package.name -ne "nexty-labs-marketing-crm") {
    throw "package.json tidak dikenali. Patch dibatalkan."
}

$TargetRelative = "lib/spreadsheet-import.ts"
$TargetPath = Project-Path $TargetRelative
if (-not (Test-Path -LiteralPath $TargetPath)) {
    throw "$TargetRelative tidak ditemukan."
}

Write-Host ""
Write-Host "Nexty Marketing - Phase 03C / Regex Repair" -ForegroundColor DarkYellow
Write-Host ("Project: {0}" -f $ProjectRoot)
Write-Host ""

$Before = [System.IO.File]::ReadAllText($TargetPath, $Utf8)
$After = $Before

# Phase 03B can turn [_\u2013\u2014-] into [_---], which is an invalid JS regex.
$After = $After.Replace('.replace(/[_---]+/g, " ")', '.replace(/[_\u2013\u2014-]+/g, " ")')

# Restore semantic handling for cells containing only dash/en-dash/em-dash.
$After = $After.Replace('return /^(?:-|-|-|n\/?a|null)$/i.test(result) ? "" : result;', 'return /^(?:[-\u2013\u2014]|n\/?a|null)$/i.test(result) ? "" : result;')

# If the first replacement was not possible, repair the normalizeHeader line by context.
if ($After.Contains('.replace(/[_---]+/g, " ")')) {
    throw "Regex rusak masih ditemukan setelah repair. Patch dibatalkan."
}

$ExpectedNormalize = '.replace(/[_\u2013\u2014-]+/g, " ")'
$ExpectedEmptyCell = 'return /^(?:[-\u2013\u2014]|n\/?a|null)$/i.test(result) ? "" : result;'

if (-not $After.Contains($ExpectedNormalize)) {
    throw "Pola normalizeHeader yang diharapkan tidak ditemukan. File mungkin sudah berubah manual; patch tidak akan menebak."
}

if (-not $After.Contains($ExpectedEmptyCell)) {
    # The second line may still be the original Unicode version. It is valid, so do not fail.
    Write-Host "Catatan: regex empty-cell tidak perlu diubah; bentuk saat ini masih valid." -ForegroundColor DarkGray
}

if ($After -eq $Before) {
    Write-Host "Tidak ada perubahan: regex sudah dalam kondisi aman." -ForegroundColor Green
}
else {
    New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
    Copy-Item -LiteralPath $TargetPath -Destination (Join-Path $BackupRoot "spreadsheet-import.ts") -Force
    [System.IO.File]::WriteAllText($TargetPath, $After, $Utf8)
    Write-Host ("UPDATE: {0}" -f $TargetRelative) -ForegroundColor Yellow
    Write-Host ("Backup: {0}" -f $BackupRoot) -ForegroundColor DarkGray
}

# Scan runtime source for the exact corruption pattern introduced by Phase 03B.
$BadMatches = New-Object System.Collections.Generic.List[string]
foreach ($RootName in @("app", "components", "lib", "tests")) {
    $RootPath = Project-Path $RootName
    if (-not (Test-Path -LiteralPath $RootPath)) { continue }

    Get-ChildItem -LiteralPath $RootPath -Recurse -File |
        Where-Object { @(".ts", ".tsx", ".js", ".jsx") -contains $_.Extension.ToLowerInvariant() } |
        ForEach-Object {
            $Text = [System.IO.File]::ReadAllText($_.FullName, $Utf8)
            if ($Text.Contains("[_---]")) {
                $Relative = $_.FullName.Substring($ProjectRoot.Length).TrimStart([char]0x5C, [char]0x2F)
                $BadMatches.Add($Relative)
            }
        }
}

if ($BadMatches.Count -gt 0) {
    Write-Host "Masih ditemukan pola regex rusak di:" -ForegroundColor Red
    $BadMatches | Sort-Object -Unique | ForEach-Object { Write-Host ("  - {0}" -f $_) -ForegroundColor Red }
    throw "Regex sanity check gagal."
}

Write-Host ""
Write-Host "Phase 03C berhasil." -ForegroundColor Green
Write-Host "Hapus cache Next.js lalu jalankan dev server kembali:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue"
Write-Host "  npm run dev"
Write-Host ""
