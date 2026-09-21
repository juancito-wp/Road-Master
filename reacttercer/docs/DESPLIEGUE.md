# Despliegue en la nube — Quinto avance

Guía para publicar la aplicación **React + Vite → FastAPI → MySQL** y demostrar que funciona fuera del entorno local.
La plataforma recomendada por la guía del avance es **Railway**, y la misma configuración sirve para cualquier
proveedor que acepte contenedores Docker (Render, Fly.io, Azure Container Apps, etc.).

---

## 1. Arquitectura de despliegue

```
Navegador
   │  (HTTPS)
   ▼
[ Servicio frontend: React + Vite servido por Nginx ]   ←  Dockerfile (frontend/)
   │  VITE_API_URL = https://<backend>.up.railway.app/api
   ▼
[ Servicio backend: FastAPI + Uvicorn ]                  ←  Dockerfile (backend_fastapi/)
   │  DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, FRONTEND_ORIGIN
   ▼
[ Base de datos MySQL ]                                  ←  Plugin MySQL de Railway
```

Archivos de despliegue incluidos en el repositorio:

| Archivo | Función |
| --- | --- |
| `backend_fastapi/Dockerfile` | Imagen del backend FastAPI (puerto dinámico `$PORT`). |
| `backend_fastapi/Procfile` | Alternativa a Docker usando Nixpacks. |
| `backend_fastapi/.env.example` | Variables de entorno del backend (sin credenciales reales). |
| `frontend/Dockerfile` | Compila el SPA y lo publica con Nginx. |
| `frontend/nginx.conf` + `frontend/docker-entrypoint.sh` | Puerto dinámico, respaldo de rutas SPA y gzip. |
| `frontend/.env.example` | Variable `VITE_API_URL` del frontend. |
| `railway.json`, `frontend/railway.json` | Build por Dockerfile y healthcheck `/api/health`. |
| `.dockerignore` | Evita copiar `node_modules`, `venv`, `.env` ni logs a las imágenes. |

---

## 2. Base de datos

1. En Railway crea el proyecto y agrega el plugin **MySQL** (`+ New → Database → MySQL`).
2. Copia la cadena de conexión y **cámbiala al driver PyMySQL**:

   ```
   mysql+pymysql://root:<PASSWORD>@<HOST>:<PORT>/railway
   ```

3. Abre la base de datos con el cliente web de Railway (o `mysql`) y ejecuta el script actualizado:

   ```bash
   mysql -h <HOST> -P <PORT> -u root -p < database.sql
   ```

   El script crea las tablas del quinto avance: `ventas`, `detalle_ventas`, `facturas`,
   `detalle_facturas`, `pqr`, `conversaciones` y `mensajes`, además de las tablas de avances anteriores.

4. Registra un usuario administrador desde `POST /api/usuarios/registro` y actualiza su rol a `admin`
   con `UPDATE usuarios SET rol = 'admin' WHERE email = '...';` (el registro público siempre crea clientes).

---

## 3. Backend (FastAPI)

1. `+ New → GitHub Repo` y selecciona el repositorio.
2. En **Settings → Build** elige *Dockerfile* con la ruta `backend_fastapi/Dockerfile`
   (o deja que tome `railway.json` de la raíz).
3. Configura las variables de entorno en **Variables**:

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | `mysql+pymysql://root:<PASSWORD>@<HOST>:<PORT>/railway` |
   | `JWT_SECRET` | cadena aleatoria larga (nunca la del repositorio) |
   | `JWT_EXPIRE_HOURS` | `8` |
   | `FRONTEND_ORIGIN` | `https://<frontend>.up.railway.app` (se aceptan varias separadas por coma) |
   | `PUBLIC_FRONTEND_URL` | `https://<frontend>.up.railway.app` |
   | `PUBLIC_BASE_URL` | `https://<backend>.up.railway.app` (URL pública de las imágenes) |
   | `IMPUESTO_PORCENTAJE` | `19` |
   | `OPENAI_API_KEY` | clave privada del chatbot (ver sección 5) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | recuperación de contraseña |
4. En **Settings → Networking** genera el dominio público. El contenedor escucha en `$PORT`,
   así que no cambies ese valor: Railway lo inyecta automáticamente.
5. Verifica el despliegue: `https://<backend>.up.railway.app/api/health` debe responder
   `{"status":"OK","mensaje":"Conexión exitosa"}` y la documentación queda en `/docs`.
6. Si necesitas conservar las imágenes subidas por el administrador, monta un **Volume** en
   `/app/backend_fastapi/uploads`.

---

## 4. Frontend (React + Vite)

1. Crea un segundo servicio desde el mismo repositorio y define **Root Directory = `frontend`**.
2. Variables de entorno del servicio:

   | Variable | Valor |
   | --- | --- |
   | `VITE_API_URL` | `https://<backend>.up.railway.app/api` |
   | `PORT` | lo asigna Railway (el entrypoint de Nginx lo respeta) |

   `VITE_API_URL` se inyecta **en tiempo de build**, por eso el `Dockerfile` la recibe como `ARG`.
3. Genera el dominio público y abre la URL. El SPA carga el catálogo, el login y los paneles.
4. Si cambias la URL del backend, vuelve a desplegar el frontend para recompilar con el nuevo valor.

---

## 5. Chatbot con Inteligencia Artificial

1. Crea una clave de API de **OpenAI** en <https://platform.openai.com/api-keys>.
2. Guárdala **solo** en la variable `OPENAI_API_KEY` del backend (local y en la nube).
   Nunca la escribas en el código, en capturas ni en el repositorio: `backend_fastapi/.gitignore`
   ya excluye `.env` y el `.dockerignore` evita copiarlo dentro de la imagen.
   Opcionalmente ajusta el modelo con `OPENAI_MODEL` (por defecto `gpt-4o-mini`).
3. La integración vive en `backend_fastapi/services/ia.py` (SDK oficial `openai`) y se consume desde
   `POST /api/chatbot/mensaje`. La respuesta incluye `"fuente": "openai"` cuando la IA respondió y
   `"fuente": "local"` cuando no hay clave o el servicio externo falla (el chat sigue funcionando
   con el catálogo real).
4. Para verificar desde Postman: enviar un mensaje y revisar `respuesta` y `fuente`.

---

## 6. Buenas prácticas aplicadas

- **Variables de entorno** para toda credencial (base de datos, JWT, SMTP y API Key de IA).
- **`.env` fuera de Git** (`backend_fastapi/.gitignore`) y `.env.example` como plantilla sin secretos.
- **CORS restringido**: `FRONTEND_ORIGIN` admite la URL pública del frontend (varias separadas por coma);
  en local se agregan automáticamente `http://localhost:5173` y `http://127.0.0.1:5173`.
- **JWT + control de roles** en todos los endpoints nuevos (`require_roles('admin', 'empleado')`
  para reportes, facturación y estadísticas; el cliente solo ve su propia información).
- **Contraseñas con bcrypt** (hash, nunca texto plano).

---

## 7. Prueba del despliegue (evidencias)

1. `/api/health` en verde con la URL pública.
2. Login del administrador desde la URL pública.
3. Registro de una venta y consulta del historial (usa datos reales, no locales).
4. Reporte diario descargado en PDF y Excel desde el entorno desplegado.
5. Factura generada y consultada; descarga del PDF.
6. Dashboards administrativo, de empleado y de cliente con gráficos y cards.
7. PQR registrada por un cliente y respondida por el administrador.
8. Conversación con el chatbot mostrando `"fuente": "openai"`.
9. Captura de las variables de entorno **con los valores ocultos** (nunca muestres la API Key).
