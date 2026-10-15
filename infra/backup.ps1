# ==============================================================================
# DUALITY ROL — SCRIPT DE BACKUP (POWERSHELL / WINDOWS)
# Exporta la base de datos PostgreSQL local y respalda la carpeta de imágenes.
# ==============================================================================

param (
    [string]$BackupDir = "./backups"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$sqlFile = "$BackupDir/duality_db_$timestamp.dump"
Write-Host "[Duality Rol] Iniciando copia de seguridad: $timestamp" -ForegroundColor Cyan

# 1. Backup de PostgreSQL
Write-Host "1/2 Exportando base de datos PostgreSQL..." -ForegroundColor Yellow
$pgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

if (-not (Test-Path $pgDumpPath)) {
    $found = Get-Command pg_dump -ErrorAction SilentlyContinue
    if ($found) {
        $pgDumpPath = $found.Source
    }
}

if (-not (Test-Path $pgDumpPath)) {
    Write-Error "No se encontro pg_dump.exe en C:\Program Files\PostgreSQL\18\bin ni en PATH."
}

$env:PGPASSWORD = "duality_secure_password_dev_only"
& $pgDumpPath -U duality_user -d duality_rol -h 127.0.0.1 -p 5432 --clean --if-exists -F c -f $sqlFile
Write-Host "Base de datos guardada en: $sqlFile" -ForegroundColor Green

# 2. Backup de Imagenes (Media)
$uploadsDir = "./uploads"
$mediaZip = "$BackupDir/duality_media_$timestamp.zip"
Write-Host "2/2 Comprimiendo archivos de imagenes..." -ForegroundColor Yellow

if (Test-Path $uploadsDir) {
    Compress-Archive -Path "$uploadsDir/*" -DestinationPath $mediaZip -Force
    Write-Host "Imagenes guardadas en: $mediaZip" -ForegroundColor Green
} else {
    Write-Host "La carpeta de uploads aun no contiene imagenes. Se omite el empaquetado." -ForegroundColor DarkGray
}

Write-Host "Copia de seguridad finalizada con exito." -ForegroundColor Cyan
