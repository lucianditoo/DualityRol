#!/usr/bin/env bash
# ==============================================================================
# DUALITY ROL — SCRIPT DE COPIA DE SEGURIDAD (BACKUP)
# Realiza backup de la base de datos PostgreSQL y del volumen de imágenes.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="${DB_CONTAINER:-duality_postgres}"
DB_NAME="${DB_NAME:-duality_rol}"
DB_USER="${DB_USER:-duality_user}"

mkdir -p "${BACKUP_DIR}"

echo "🌌 [Duality Rol] Iniciando copia de seguridad: ${TIMESTAMP}"

# 1. Backup de PostgreSQL
SQL_FILE="${BACKUP_DIR}/duality_db_${TIMESTAMP}.sql.gz"
echo "📦 1/2 Exportando base de datos PostgreSQL..."
docker exec -t "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${SQL_FILE}"
echo "✓ Base de datos guardada en: ${SQL_FILE}"

# 2. Backup de Imágenes (Media)
MEDIA_FILE="${BACKUP_DIR}/duality_media_${TIMESTAMP}.tar.gz"
echo "🖼️  2/2 Comprimiendo archivos de imágenes..."
docker run --rm \
  --volumes-from "${DB_CONTAINER}" \
  -v duality_media_data:/media_source:ro \
  -v "$(pwd)/${BACKUP_DIR}:/backup_dest" \
  alpine tar -czf "/backup_dest/duality_media_${TIMESTAMP}.tar.gz" -C /media_source .
echo "✓ Imágenes guardadas en: ${MEDIA_FILE}"

echo "✨ Copia de seguridad finalizada con éxito."
