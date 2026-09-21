# Quinto avance — Documentación técnica

Evolución del proyecto **Road Master** sobre la arquitectura del cuarto avance:
**React + Vite → FastAPI → Base de datos SQL**, con autenticación JWT y control de roles.

---

## 1. Nuevas funcionalidades

| # | Requerimiento | Implementación |
| --- | --- | --- |
| 1 | Módulo de ventas | `POST /api/ventas` — tabla `ventas` (cliente, vendedor, fecha, subtotal, descuento, impuesto, total, estado, observaciones). |
| 2 | Registro de productos y servicios vendidos | Tabla `detalle_ventas` con `producto_id` o `servicio_id`, cantidad, precio unitario, descuento y subtotal. |
| 3 | Historial de ventas | `GET /api/ventas` con filtros por fecha, cliente, producto, servicio, estado, rango de valor y texto. |
| 4 | Reporte diario de ventas | `GET /api/reportes/ventas-diario?fecha=` (JSON con resumen y detalle). |
| 5 | Exportación del reporte en PDF | `GET /api/reportes/ventas-diario/pdf` (reportlab: proyecto, fecha, ventas, totales y pie de generación). |
| 6 | Exportación del reporte en Excel | `GET /api/reportes/ventas-diario/excel` (openpyxl: columnas, formatos monetarios y autofiltro). |
| 7 | Generación de facturas | `POST /api/facturas` a partir de una venta (tablas `facturas` + `detalle_facturas`). |
| 8 | Consulta de facturas | `GET /api/facturas` por número, cliente, fecha, estado y búsqueda libre. |
| 9 | Descarga de facturas | `GET /api/facturas/{id}/pdf` (PDF con datos del cliente, detalle y totales). |
| 10 | Dashboard administrativo | `GET /api/estadisticas/dashboard` → usuarios, productos, servicios, ventas, facturación y PQR. |
| 11 | Dashboard de ventas | `GET /api/estadisticas/ventas` → cards + serie temporal + ranking; gráfico de barras y lineal con Recharts. |
| 12 | Dashboards por rol | El endpoint ajusta los indicadores según `admin`, `empleado` o `cliente`; el frontend oculta secciones no autorizadas. |
| 13 | Filtros de los dashboards | Fecha inicial/final, agrupación (día/semana/mes), producto, servicio, cliente y estado. |
| 14 | Nuevos endpoints en FastAPI | 21 endpoints nuevos (ver sección 3). |
| 15 | Dashboard integrado con FastAPI | React consume los endpoints: ningún indicador está escrito en el frontend. |
| 16 | Módulo PQR | `POST /api/pqr`, `GET /api/pqr`, `PATCH /api/pqr/{id}/estado`, `POST /api/pqr/{id}/respuesta` con estados pendiente, en proceso, respondida y cerrada. |
| 17 | Chatbot de atención | `frontend/src/components/chatbot/ChatbotWidget.jsx`, integrado al sitio público, con preguntas frecuentes y orientación de PQR. |
| 18 | Chatbot con IA | `backend_fastapi/services/ia.py` llama a la API de OpenAI (Chat Completions) con el catálogo real como contexto; respaldo local si no hay clave. |
| 19 | API Key segura | `OPENAI_API_KEY` en variables de entorno; `.env` ignorado por Git y por `.dockerignore`. |
| 20 | Despliegue | Dockerfiles, Nginx, `railway.json`, `Procfile` y guía en `docs/DESPLIEGUE.md`. |

---

## 2. Base de datos

`database.sql` agrega las tablas (con claves foráneas, índices y estados `ENUM`):

- `ventas` → cliente y usuario que registra, fecha, montos y estado (`pendiente`, `pagada`, `anulada`).
- `detalle_ventas` → venta, producto o servicio, cantidad, precio unitario, descuento y subtotal.
- `facturas` → número único, venta (1 a 1), cliente, fecha, montos y estado (`emitida`, `pagada`, `anulada`).
- `detalle_facturas` → copia del detalle de la venta facturada.
- `pqr` → usuario, tipo (`peticion`, `queja`, `reclamo`, `sugerencia`), asunto, descripción, estado, respuesta y auditoría.
- `conversaciones` y `mensajes` → historial persistente del chatbot con IA.

Aplicar los cambios en una base existente (crea solo lo que falte):

```bash
mysql -u root -p road_master < database.sql
```

---

## 3. Nuevos endpoints

### Ventas
| Método | Ruta | Roles |
| --- | --- | --- |
| POST | `/api/ventas` | admin, empleado, cliente |
| GET | `/api/ventas` | autenticados (el cliente solo ve sus ventas) |
| GET | `/api/ventas/{id}` | autenticados con control de propiedad |
| PATCH | `/api/ventas/{id}/estado` | admin, empleado |

### Facturación
| Método | Ruta | Roles |
| --- | --- | --- |
| POST | `/api/facturas` | autenticados con control de propiedad |
| GET | `/api/facturas` | autenticados |
| GET | `/api/facturas/{id}` | autenticados con control de propiedad |
| GET | `/api/facturas/{id}/pdf` | autenticados con control de propiedad |
| PATCH | `/api/facturas/{id}/estado` | admin, empleado |

### Reportes
| Método | Ruta | Roles |
| --- | --- | --- |
| GET | `/api/reportes/ventas-diario` | admin, empleado |
| GET | `/api/reportes/ventas-diario/pdf` | admin, empleado |
| GET | `/api/reportes/ventas-diario/excel` | admin, empleado |

### PQR
| Método | Ruta | Roles |
| --- | --- | --- |
| POST | `/api/pqr` | autenticados |
| GET | `/api/pqr` | autenticados (el cliente solo ve las propias) |
| GET | `/api/pqr/{id}` | autenticados con control de propiedad |
| PATCH | `/api/pqr/{id}/estado` | admin, empleado |
| POST | `/api/pqr/{id}/respuesta` | admin, empleado |

### Chatbot
| Método | Ruta | Roles |
| --- | --- | --- |
| POST | `/api/chatbot/mensaje` | público (asocia la conversación si hay JWT) |
| GET | `/api/chatbot/mensajes/{sesion}` | público con validación de propiedad |
| GET | `/api/chatbot/conversaciones` | admin, empleado |

### Estadísticas
| Método | Ruta | Roles |
| --- | --- | --- |
| GET | `/api/estadisticas/dashboard` | autenticados (indicadores según el rol) |
| GET | `/api/estadisticas/ventas` | autenticados (con filtros) |

---

## 4. Estructura del código nuevo

```
backend_fastapi/
├── common.py                  # serialización de ventas, facturas, PQR y clientes
├── models.py                  # modelos SQLAlchemy de las nuevas tablas
├── schemas.py                 # esquemas Pydantic (validación separada de los modelos)
├── routers/
│   ├── ventas.py              # registro e historial de ventas
│   ├── facturas.py            # facturación, consulta y PDF
│   ├── reportes.py            # reporte diario JSON/PDF/Excel
│   ├── pqr.py                 # gestión de PQR
│   ├── chatbot.py             # conversaciones y mensajes del chatbot
│   └── estadisticas.py        # indicadores y series de los dashboards
├── services/
│   ├── reportes.py            # construcción de PDF (reportlab) y Excel (openpyxl)
│   └── ia.py                  # integración con OpenAI + respaldo local
└── tests/test_quinto_avance.py  # 37 verificaciones end-to-end

frontend/src/
├── hooks/useModuloComercial.js          # carga y acciones del módulo comercial
├── utils/formato.js                     # moneda, fechas, estados y descarga de archivos
├── components/panel/
│   ├── DashboardVentas.jsx              # cards + filtros + gráficos
│   ├── GraficoBarras.jsx / GraficoLineal.jsx   # Recharts
│   ├── TarjetasIndicadores.jsx          # cards que llegan desde FastAPI
│   ├── FormularioVenta.jsx              # registro de ventas con detalle
│   ├── HistorialVentas.jsx              # historial con filtros y facturación
│   ├── GestionFacturas.jsx              # consulta y descarga de facturas
│   ├── ReporteDiario.jsx                # reporte diario + PDF/Excel
│   └── GestionPqr.jsx                   # registro, gestión y respuesta de PQR
└── components/chatbot/ChatbotWidget.jsx # chatbot flotante del sitio público
```

---

## 5. Seguridad

- **JWT** en todas las rutas protegidas (`Authorization: Bearer <token>`).
- **Control de roles**: `require_roles('admin', 'empleado')` en reportes, facturación y estadísticas;
  el cliente solo accede a su propia información (ventas, facturas y PQR).
- **Validaciones** con Pydantic: cantidades mayores a cero, descuentos no negativos, estados permitidos,
  longitudes de texto y verificación de que cada detalle tenga producto **o** servicio.
- **Contraseñas con bcrypt** y recuperación por código de seis dígitos.
- **Credenciales fuera del repositorio**: `.env` + variable `OPENAI_API_KEY` en el entorno.

---

## 6. Cómo ejecutar y probar

```bash
# 1) Base de datos
mysql -u root -p < database.sql

# 2) Backend (desde la raíz del proyecto)
../.venv/Scripts/python.exe -m uvicorn backend_fastapi.main:app --reload --port 8000

# 3) Frontend
npm --prefix frontend run dev

# 4) Pruebas automatizadas de los nuevos endpoints
../.venv/Scripts/python.exe -m backend_fastapi.tests.test_quinto_avance
```

Las pruebas crean usuarios y datos temporales (`prueba.quinto...@roadmaster.test`) y los eliminan al finalizar.
Resultado esperado: **37 verificaciones superadas**.

Para las pruebas manuales con Postman usa `postman/Road-Master-Quinto-Avance.postman_collection.json`
y la guía `postman/GUIA-POSTMAN-QUINTO-AVANCE.md`.

---

## 7. Mapa de evidencias

| Evidencia solicitada | Dónde obtenerla |
| --- | --- |
| Registro de una venta | Panel admin/empleado → Ventas → *Registrar venta* (o `POST /api/ventas`). |
| Historial de ventas | Ventas → *Filtros de búsqueda* aplicados. |
| Reporte diario | Reportes → fecha → tabla y resumen. |
| Exportación a PDF | Reportes → *Exportar PDF*. |
| Exportación a Excel | Reportes → *Exportar Excel*. |
| Generación de factura | Ventas → *Generar factura* (o `POST /api/facturas`). |
| Consulta de factura | Facturación → filtros por número/cliente/fecha. |
| Dashboards por rol | Resumen + Dashboard de ventas en cada panel. |
| Gráficos de barras y lineales | Dashboard de ventas (Recharts). |
| Cards de indicadores | Resumen y Dashboard de ventas. |
| Registro y gestión de PQR | Panel del cliente (registrar) y panel admin/empleado (gestionar y responder). |
| Chatbot | Botón flotante del sitio público. |
| Conversación con IA | Chatbot con `OPENAI_API_KEY` configurada (`"fuente": "openai"`). |
| Variables de entorno sin exponer claves | `.env.example` y captura de la configuración con valores ocultos. |
| Pruebas de endpoints | Colección Postman + `backend_fastapi/tests`. |
| Aplicación desplegada | Ver `docs/DESPLIEGUE.md` y la URL pública. |
