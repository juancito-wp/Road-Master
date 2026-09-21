# Guía Postman — Quinto avance

Pruebas de los nuevos endpoints de ventas, facturación, reportes, PQR, chatbot con IA y estadísticas.

## 1. Preparación

1. Importa `postman/Road-Master-Quinto-Avance.postman_collection.json`.
2. Ajusta las variables de la colección:

   | Variable | Descripción | Valor por defecto |
   | --- | --- | --- |
   | `base_url` | URL del API (local o desplegada) | `http://localhost:8000/api` |
   | `email_admin` / `password_admin` | credenciales del administrador | `admin@roadmaster.com` / `Admin1234` |
   | `email_cliente` / `password_cliente` | credenciales de un cliente | `cliente@roadmaster.com` / `Cliente1234` |
   | `producto_id` / `servicio_id` | ítems del catálogo a vender | `1` |
   | `fecha` | fecha del reporte diario | la del día de la prueba |

3. Ejecuta primero las dos peticiones de **Autenticación**: guardan `token_admin`, `token_cliente` y `cliente_id`.

> Si aún no tienes esas cuentas, regístralas con `POST {{base_url}}/auth/registro` (crea clientes)
> y, para el administrador, actualiza el rol en la base de datos: `UPDATE usuarios SET rol='admin' WHERE email='...';`

## 2. Orden recomendado y resultado esperado

| Petición | Resultado esperado |
| --- | --- |
| `POST /ventas` (cliente) | `201` + `venta.detalles[]`; guarda `venta_id`. |
| `POST /ventas` (empleado) | `201` usando `clienteId`; cambia `venta_id`. |
| `GET /ventas?...` | `200` con el arreglo `ventas` filtrado. |
| `GET /ventas/{{venta_id}}` | `200` con el detalle de la venta. |
| `PATCH /ventas/{{venta_id}}/estado` | `200` con el nuevo estado. |
| `POST /facturas` | `201` con `numero` tipo `FAC-AAAAMMDD-00001`; guarda `factura_id`. |
| `GET /facturas?numero=...` | `200` con la factura buscada. |
| `GET /facturas/{{factura_id}}/pdf` | `200`, cuerpo que inicia con `%PDF-`. |
| `PATCH /facturas/{{factura_id}}/estado` | `200` y la venta asociada pasa a `pagada`. |
| `GET /reportes/ventas-diario?fecha=...` | `200` con `resumen` y `ventas`. |
| `GET /reportes/ventas-diario/pdf` | `200`, cuerpo `%PDF-`. |
| `GET /reportes/ventas-diario/excel` | `200`, cuerpo `PK` (archivo `.xlsx`). |
| `POST /pqr` (cliente) | `201`; guarda `pqr_id`. |
| `GET /pqr` (cliente) | `200` con sus PQR y el resumen por estado. |
| `GET /pqr?...` (admin) | `200` con todas las PQR filtradas. |
| `PATCH /pqr/{{pqr_id}}/estado` | `200`; pasa a `en proceso`. |
| `POST /pqr/{{pqr_id}}/respuesta` | `200`; la PQR pasa a `respondida`. |
| `POST /chatbot/mensaje` | `200` con `respuesta`, `sesion` y `fuente` (`openai` o `local`). |
| `POST /chatbot/mensaje` (con `sesion`) | `200`, mantiene el contexto de la conversación. |
| `GET /chatbot/mensajes/{{sesion_chat}}` | `200` con el historial persistido. |
| `GET /chatbot/conversaciones` (admin) | `200` con las conversaciones registradas. |
| `GET /estadisticas/dashboard` (admin) | `200` con las cards de todos los indicadores. |
| `GET /estadisticas/dashboard` (cliente) | `200` con las cards propias (`misVentas`, `misPQR`, ...). |
| `GET /estadisticas/ventas?...` | `200` con `cards`, `temporal` y `productos` para los gráficos. |

## 3. Pruebas de seguridad sugeridas

| Escenario | Resultado esperado |
| --- | --- |
| `GET /ventas` sin token | `403` (`Acceso denegado: No se proporcionó un token`). |
| `GET /reportes/ventas-diario` con token de cliente | `403` (requiere rol admin/empleado). |
| `GET /ventas/{{venta_id}}` de otro cliente | `403` (`esta venta no te pertenece`). |
| `POST /facturas` con la misma venta dos veces | `409` (la venta ya tiene factura). |
| `POST /ventas` con cantidad `0` | `422` con el detalle de la validación. |

## 4. Evidencias

Guarda capturas de: registro de venta, historial filtrado, reporte diario, PDF, Excel,
factura generada y consultada, PQR registrada y respondida, conversación con el chatbot
(mostrando `fuente: openai`), dashboards con gráficos y cards, y la respuesta `200` de `/api/health`
en la URL pública desplegada.
