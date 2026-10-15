# AGENTS.md — Protocolo de Trabajo para Agentes de Duality Rol

Este archivo define las reglas de convivencia, delimitación de responsabilidades y estándares de seguridad para cualquier agente o desarrollador que trabaje en el repositorio de **Duality Rol**.

---

## 1. Contexto de Arquitectura y Separación de Responsabilidades

El proyecto está organizado como un **monorepo modular**:

- `apps/store`: Tienda pública de cara a Internet (Clientes invitados, catálogo, carrito, checkout Mercado Pago).
- `apps/admin`: Panel comercial privado (Solo accesible vía Tailscale + autenticación propia, gestión de productos, inventario, pedidos y retiros).
- `packages/database`: Esquema de Prisma, migraciones SQL y cliente tipado de base de datos.
- `packages/config-contracts`: Esquemas de validación Zod y tipos compartidos de dominio.
- `infra/`: Scripts de despliegue, Docker Compose, backups y restauración.

---

## 2. Reglas de Aislamiento por Conversación / Rol de Agente

Para evitar conflictos de contexto y regresiones entre aplicaciones, cada agente debe respetar estrictamente su ámbito de acción:

### A. Agente de la Tienda (`apps/store`)
- **Permitido:** Modificar interfaces de catálogo, fichas de producto, carrito, checkout y webhooks de Mercado Pago dentro de `apps/store/`.
- **PROHIBIDO:** 
  - Importar o hacer referencia a código, componentes o rutas de `apps/admin/`.
  - Crear rutas públicas que expongan operaciones administrativas (`/api/admin/*`, `/admin/*`, etc.).
  - Escribir queries directas que muten precios de catálogo o alteren usuarios del sistema.
  - Modificar `packages/database/prisma/schema.prisma` sin coordinación explícita.

### B. Agente del Administrador (`apps/admin`)
- **Permitido:** Modificar vistas de gestión, carga de productos, administración de stock, visualización de órdenes y endpoints internos de `apps/admin/`.
- **PROHIBIDO:**
  - Importar o modificar componentes visuales de `apps/store/`.
  - Exponer el panel fuera de la red privada de Tailscale.
  - Desactivar o saltarse la autenticación/autorización de sesiones.
  - Modificar `packages/database/prisma/schema.prisma` sin coordinación explícita.

### C. Agente de Datos e Infraestructura (`packages/*`, `infra/`, raíz)
- **Responsabilidad exclusiva:** Modificar `packages/database`, `packages/config-contracts`, `docker-compose.yml`, scripts de `infra/` y dependencias raíz.
- Cuando un agente de aplicación necesite un cambio en el modelo de base de datos:
  1. Debe justificar el cambio de esquema.
  2. El cambio debe ser retrocompatible o documentar la migración de datos.
  3. Ejecutar las migraciones y regenerar el cliente de Prisma antes de que las aplicaciones consuman los nuevos campos.

---

## 3. Principios de Seguridad Comerciales Obligatorios

1. **Precios y Totales Soberanos:**
   - Jamás confiar en precios, descuentos o totales enviados por el frontend.
   - El cálculo de importes se realiza **siempre** en el servidor consultando la base de datos en el instante de la transacción.
2. **Control de Inventario y Concurrencia:**
   - Descontar o reservar stock mediante transacciones atómicas (`prisma.$transaction`).
   - Evitar sobreventa en productos de tirada limitada o piezas únicas 3D.
3. **Idempotencia de Pagos:**
   - Todo webhook o evento de Mercado Pago debe registrarse y verificarse criptográficamente (`x-signature`).
   - Procesar una notificación más de una vez jamás debe duplicar pedidos, generar cobros dobles ni descontar stock repetidamente.
4. **Secretos y Credenciales:**
   - Prohibido commitear tokens de Mercado Pago, secretos de sesión, contraseñas de base de datos o claves privadas.
   - Utilizar siempre variables de entorno tipadas mediante Zod.
   - Durante desarrollo, utilizar exclusivamente credenciales de prueba / sandbox.

---

## 4. Política de Imágenes y Medios

- Las imágenes se almacenan localmente en el volumen persistente montado en el servidor/Docker (`media_data`).
- Límites estrictos:
  - Tamaño máximo por imagen: **5 MB**.
  - Formatos permitidos: **WebP, PNG, JPEG**.
  - No almacenar ejecutables, SVGs con scripts ni archivos sin validar su tipo MIME real y extensión.
- La tienda pública solo debe servir versiones optimizadas para web.

---

## 5. Convenciones de Código y Commits

- **TypeScript:** Modo estricto (`"strict": true`). Prohibido el uso de `any` injustificado.
- **Validación:** Toda entrada externa (formularios, query params, webhooks) debe pasar por un esquema Zod antes de su uso.
- **Idioma de Interfaz:** Español de Argentina («Carrito», «Finalizar compra», «Retiro acordado», «ARS $»).
- **Código y Nombres Técnicos:** Nombres de variables, funciones, esquemas y bases de datos en inglés técnico descriptivo (`orderStatus`, `pickupCode`, `isSelfMade`).
