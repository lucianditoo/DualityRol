# Infraestructura y Operaciones — Duality Rol

Este directorio contiene las especificaciones y herramientas de infraestructura para desplegar **Duality Rol** tanto en desarrollo local (Windows con WSL2 o Docker Desktop) como en el servidor definitivo Linux.

---

## 1. Servicios Orquestados (Docker Compose)

| Servicio | Contenedor | Red Interna | Puerto Expuesto Local | Notas de Acceso |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | `duality_postgres` | `duality_network` | `127.0.0.1:5432` | Persistencia en volumen `duality_postgres_data`. No exponer a Internet. |
| **Tienda Pública** | `duality_store` | `duality_network` | `3000` | Acceso web para clientes. Se publicará mediante **Cloudflare Tunnel**. |
| **Administrador** | `duality_admin` | `duality_network` | `127.0.0.1:3001` | Solo accesible mediante **Tailscale** (o localhost en desarrollo). |

---

## 2. Volúmenes Persistentes

- `duality_postgres_data`: Archivos de datos del motor PostgreSQL.
- `duality_media_data`: Almacenamiento local de fotografías de productos subidas desde el panel de administración. Montado como *lectura y escritura* (`rw`) en el panel de administración y como *solo lectura* (`ro`) en la tienda pública.

---

## 3. Guía de Ejecución Local

### Opción A: Docker Compose (Recomendada si Docker Desktop o WSL2 están activos)
```bash
# Iniciar todos los servicios
docker compose up -d

# Ver registros de logs en tiempo real
docker compose logs -f

# Detener los servicios sin borrar datos
docker compose down
```

### Opción B: Base de Datos en Docker + Aplicaciones con Node.js Local
Si preferís desarrollar con hot-reload nativo en Windows:
```bash
# 1. Levantar solo PostgreSQL en Docker:
docker compose up -d postgres

# 2. Generar el cliente de base de datos y migrar:
npm run db:generate
npm run db:migrate

# 3. Cargar las categorías iniciales:
npm run db:seed

# 4. Iniciar la tienda (puerto 3000):
npm run dev:store

# 5. En otra terminal, iniciar el administrador (puerto 3001):
npm run dev:admin
```

---

## 4. Copias de Seguridad (Backups)

### Backup Manual
```bash
chmod +x ./infra/backup.sh
./infra/backup.sh
```
El script generará dos archivos comprimidos en `./backups/`:
1. `duality_db_YYYYMMDD_HHMMSS.sql.gz` (Exportación de PostgreSQL).
2. `duality_media_YYYYMMDD_HHMMSS.tar.gz` (Fotos de productos).

### Backup Automatizado en Linux (Cron Diario a las 03:00 AM)
Agregá la siguiente línea en `crontab -e` del servidor:
```cron
0 3 * * * cd /ruta/al/proyecto/DualityRol && ./infra/backup.sh >> /var/log/duality_backup.log 2>&1
```

---

## 5. Restauración de Datos

Para restaurar una copia de seguridad específica:
```bash
chmod +x ./infra/restore.sh
./infra/restore.sh ./backups/duality_db_20261015_120000.sql.gz ./backups/duality_media_20261015_120000.tar.gz
```
El script solicitará confirmación interactiva para evitar sobrescrituras accidentales.
