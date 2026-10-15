# ==============================================================================
# DUALITY ROL — SCRIPT DE RESTAURACION (POWERSHELL / WINDOWS)
# Uso: .\infra\restore.ps1 -SqlDump ".\backups\duality_db_XXXX.dump" [-MediaZip ".\backups\duality_media_XXXX.zip"]
# ==============================================================================

param (
    [Parameter(Mandatory = $true)]
    [string]$SqlDump,

    [Parameter(Mandatory = $false)]
    [string]$MediaZip,

    [switch]$Force
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SqlDump)) {
    Write-Error "El archivo de volcado $SqlDump no existe."
}

if (-not $Force) {
    Write-Host "ADVERTENCIA: Esta operacion sobrescribira la base de datos duality_rol." -ForegroundColor Yellow
    $confirm = Read-Host "Estas seguro de continuar? (escribi 'si' para confirmar)"
    if ($confirm -ne "si") {
        Write-Host "Operacion cancelada." -ForegroundColor Red
        exit 0
    }
}

# 1. Restaurar PostgreSQL
Write-Host "1/2 Restaurando base de datos..." -ForegroundColor Yellow
$pgRestorePath = "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe"

if (-not (Test-Path $pgRestorePath)) {
    $found = Get-Command pg_restore -ErrorAction SilentlyContinue
    if ($found) {
        $pgRestorePath = $found.Source
    }
}

if (-not (Test-Path $pgRestorePath)) {
    Write-Error "No se encontro pg_restore.exe en C:\Program Files\PostgreSQL\18\bin ni en PATH."
}

$env:PGPASSWORD = "duality_secure_password_dev_only"
& $pgRestorePath -U duality_user -d duality_rol -h 127.0.0.1 -p 5432 --clean --if-exists $SqlDump
Write-Host "Base de datos restaurada." -ForegroundColor Green

# 2. Restaurar Imagenes
if ($MediaZip -and (Test-Path $MediaZip)) {
    Write-Host "2/2 Restaurando imagenes..." -ForegroundColor Yellow
    $uploadsDir = "./uploads"
    if (Test-Path $uploadsDir) {
        Remove-Item -Recurse -Force "$uploadsDir/*"
    } else {
        New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
    }
    Expand-Archive -Path $MediaZip -DestinationPath $uploadsDir -Force
    Write-Host "Imagenes restauradas en $uploadsDir." -ForegroundColor Green
}

Write-Host "Restauracion completada exitosamente." -ForegroundColor Cyan
