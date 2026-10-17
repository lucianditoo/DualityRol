# DUALITY GUARDIAN — Visión Conceptual y Arquitectura Futura

> **ESTADO DEL PROYECTO:** IDEA FUTURA / BACKLOG  
> **DIRECTIVA ACTUAL:** NO IMPLEMENTAR TODAVÍA.

---

## 1. Concepto General

**Duality Guardian** será un futuro sistema liviano de supervisión, alertas y mantenimiento preventivo para el servidor privado Linux que alojará **Duality Rol**.

Su diseño se estructura en torno a dos componentes complementarios que trabajan en conjunto pero con responsabilidades y naturalezas estrictamente diferenciadas:

### LUZ — El guardián de las instrucciones

- **Naturaleza:** Programa determinista, sin modelo de IA.
- **Funcionamiento:** Ejecuta reglas y comprobaciones predefinidas con total previsibilidad.
- **Ámbito de supervisión:** Monitoriza CPU, RAM, temperatura, espacio en disco, estado de servicios del sistema, contenedores Docker, PostgreSQL y disponibilidad de la tienda pública.
- **Control operativo:** Comprueba la integridad de backups, rotación de logs y tareas programadas de mantenimiento.
- **Comunicación:** Genera informes estructurados y envía notificaciones de estado o alerta.
- **Acción automatizada:** Puede ejecutar exclusivamente tareas automáticas seguras, preaprobadas y estrictamente limitadas (por ejemplo, limpieza de archivos temporales acotados o reinicio controlado de un servicio caído según política explícita).
- **Huella técnica:** Debe ser extremadamente liviano, idealmente implementado con **Python** y disparado mediante **systemd timers**.

### PENUMBRA — El guardián del razonamiento

- **Naturaleza:** Módulo opcional con capacidades de Inteligencia Artificial.
- **Activación:** Se activa únicamente ante anomalías detectadas o cuando resulte necesario interpretar información compleja.
- **Capacidad analítica:** Analiza los informes generados por **Luz**, detecta patrones no evidentes, plantea hipótesis sobre causas raíz y propone soluciones razonadas.
- **Flexibilidad de motor:** Puede utilizar una API de modelo externo o un modelo local pequeño, dependiendo de las capacidades del hardware finalmente adquirido.
- **Límite estricto de seguridad:** **Jamás ejecuta comandos arbitrarios generados por IA ni modifica el entorno de producción sin autorización humana explícita.**
- **Entregables:** Prepara diagnósticos detallados y propuestas de corrección para revisión del administrador.

---

## 2. Filosofía de Diseño

**Duality Guardian** encarna una dualidad moral y filosófica coherente con la identidad de **Duality Rol**:

- **Luz** simboliza obediencia, orden, certeza, constancia y disciplina.
- **Penumbra** simboliza pensamiento crítico, interpretación, duda metódica y libertad intelectual.

El principio central que rige esta arquitectura es que **seguir instrucciones sin cuestionarlas no garantiza actuar correctamente**, mientras que **pensar libremente y cuestionar las reglas no implica necesariamente actuar mal**.

Ninguno de los dos componentes representa el bien o el mal de manera absoluta. Son fuerzas complementarias: la estructura determinista de **Luz** sostiene la operación diaria sin alucinaciones ni desvíos, mientras que la capacidad reflexiva de **Penumbra** asiste al criterio humano cuando las reglas fijas no bastan para comprender un problema nuevo.

---

## 3. Arquitectura Futura Tentativa

Cuando el proyecto alcance la etapa de infraestructura definitiva, **Duality Guardian** se diseñará bajo los siguientes lineamientos:

1. **Independencia operativa:** Servicio desacoplado e independiente de `apps/store` y `apps/admin`, capaz de continuar operando y emitiendo alertas incluso si la tienda pública o los contenedores principales caen.
2. **Eficiencia de recursos:** Comprobaciones periódicas con consumo mínimo de CPU y memoria.
3. **Canales de alerta:** Envío de notificaciones críticas y resúmenes mediante Telegram u otro canal configurable.
4. **Memoria operativa:** Registro histórico de incidentes e informes periódicos de salud del sistema.
5. **Integración visual futura:** Posibilidad de exponer un visor o panel de estado del servidor dentro de `apps/admin` para consulta de los administradores.
6. **Seguridad y mínimo privilegio:** Separación estricta de permisos de sistema operativo, acceso de solo lectura donde sea posible y auditoría completa de cada acción ejecutada.
7. **Resiliencia sin IA:** El monitoreo esencial (**Luz**) debe funcionar al 100% sin depender de **Penumbra**. La IA será siempre un módulo opcional y jamás constituirá un punto único de fallo.

---

## 4. Estado Actual y Motivos de Postergación

Este documento registra únicamente la visión conceptual en el repositorio para retomarla en una fase futura. **No se debe escribir código, configurar contenedores, instalar dependencias ni programar tareas para Duality Guardian en la etapa actual.**

### Motivos:
- **Duality Rol** se encuentra actualmente en fase de desarrollo de sus módulos centrales.
- Todavía no se ha comprado ni seleccionado el hardware definitivo del mini servidor Linux.
- No existe aún la infraestructura de producción final donde residirán los servicios.
- La prioridad absoluta del proyecto es completar la tienda pública (`apps/store`), el panel de administración (`apps/admin`), la pasarela de pagos con Mercado Pago y el flujo de despliegue base antes de iniciar **Duality Guardian**.
