#!/usr/bin/env bash
# ==============================================================================
# DUALITY ROL — SCRIPT DE RESTAURACIÓN
# Uso: ./infra/restore.sh <archivo_db.sql.gz> [archivo_media.tar.gz]
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Uso: $0 <archivo_db.sql.gz> [archivo_media.tar.gz]"
  exit 1
fi

SQL_ARCHIVE="$1"
MEDIA_ARCHIVE="${2:-}"
DB_CONTAINER="${DB_CONTAINER:-duality_postgres}"
DB_NAME="${DB_NAME:-duality_rol}"
DB_USER="${DB_USER:-duality_user}"

if [ ! -f "${SQL_ARCHIVE}" ]; then
  echo "❌ Error: El archivo ${SQL_ARCHIVE} no existe."
  exit 1
fi

echo "⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos ${DB_NAME}."
read -p "¿Estás seguro de continuar? (escribí 'si' para confirmar): " CONFIRM
if [ "${CONFIRM}" != "si" ]; then
  echo "Operación cancelada."
  exit 0
fi

# 1. Restaurar PostgreSQL
echo "📦 1/2 Restaurando base de datos..."
gunzip -c "${SQL_ARCHIVE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
echo "✓ Base de datos restaurada."

# 2. Restaurar Imágenes (si se especificó)
if [ -n "${MEDIA_ARCHIVE}" ]; then
  if [ -f "${MEDIA_ARCHIVE}" ]; then
    echo "🖼️  2/2 Restaurando imágenes..."
    docker run --rm \
      -v duality_media_data:/media_dest \
      -v "$(pwd)/$(dirname "${MEDIA_ARCHIVE}"):/backup_source:ro" \
      alpine sh -c "rm -rf /media_dest/* && tar -xzf /backup_source/$(basename "${MEDIA_ARCHIVE}") -C /media_dest"
    echo "✓ Imágenes restauradas en duality_media_data."
  else
    echo "⚠️  Aviso: El archivo de imágenes ${MEDIA_ARCHIVE} no existe. Se omite."
  fi
fi

echo "✨ Restauración completada exitosamente."
