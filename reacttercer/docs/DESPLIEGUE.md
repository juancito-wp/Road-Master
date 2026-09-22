# Despliegue en la nube — Quinto avance

Guía para publicar la aplicación **React + Vite → FastAPI → MySQL** y demostrar que funciona fuera del entorno local.
La plataforma recomendada por la guía del avance es **Railway**, y la misma configuración sirve para cualquier
proveedor que acepte contenedores Docker (Render, Fly.io, Azure Container Apps, etc.).

> **Importante — estructura del repositorio en GitHub.** El repositorio es `Road_Master` y el código del proyecto
> vive dentro de la carpeta `reacttercer/`. Por eso, en Railway **todas las rutas van con ese prefijo**: el frontend
> no está en `frontend/`, está en `reacttercer/frontend/`. Si configuras `Root Directory = frontend`, Railway no
> encuentra nada ahí y termina construyendo lo que sí está en la raíz del repositorio: el **backend**
> (ver [sección 8](#8-solución-de-problemas)).

---

## 1. Arquitectura de despliegue

```
Navegador
   │  (HTTPS)
   ▼
[ Servicio frontend: React + Vite servido por Nginx ]   ←  reacttercer/frontend/Dockerfile
   │  VITE_API_URL = https://<backend>.up.railway.app/api
   ▼
[ Servicio backend: FastAPI + Uvicorn ]                  ←  Dockerfile (raíz del repo)
   │  DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, FRONTEND_ORIGIN
   ▼
[ Base de datos MySQL ]                                  ←  Plugin MySQL de Railway
```

Archivos de despliegue incluidos en el repositorio:

| Archivo | Función |
| --- | --- |
| `Dockerfile` *(raíz del repo)* | Imagen del **backend**; es el que Railway detecta cuando el *Root Directory* del servicio es `/`. |
| `railway.json` *(raíz del repo)* | Config **común a los dos servicios**: builder Dockerfile, healthcheck `/api/health` y reintentos. **No** fija `dockerfilePath` ni `startCommand`, para que cada servicio use el `Dockerfile` de su propio *Root Directory*. |
| `reacttercer/backend_fastapi/Dockerfile` | Imagen del backend FastAPI (puerto dinámico `$PORT`) si el *Root Directory* es `reacttercer`. |
| `reacttercer/backend_fastapi/Procfile` | Alternativa a Docker usando Nixpacks. |
| `reacttercer/backend_fastapi/.env.example` | Variables de entorno del backend (sin credenciales reales). |
| `reacttercer/frontend/Dockerfile` | Compila el SPA y lo publica con Nginx. |
| `reacttercer/frontend/nginx.conf` + `reacttercer/frontend/docker-entrypoint.sh` | Puerto dinámico, respaldo de rutas SPA y gzip. |
| `reacttercer/frontend/railway.json` | Build por Dockerfile del frontend; lo usa Railway con *Root Directory* = `reacttercer/frontend`. |
| `reacttercer/frontend/.env.example` | Variable `VITE_API_URL` del frontend. |
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
2. Deja el *Root Directory* del backend en `/` (raíz del repo): así Railway usa el `Dockerfile` de la raíz, que
   copia el código desde `reacttercer/backend_fastapi/`. El `railway.json` de la raíz ya no fija el `Dockerfile`
   ni el comando de arranque: el `Dockerfile` lo resuelve cada servicio desde su *Root Directory* y el arranque
   lo aporta el `CMD` del propio `Dockerfile`.
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

1. Crea un segundo servicio desde el mismo repositorio y configura en `Settings → Source` este campo:
   - **Root Directory**: `reacttercer/frontend` (⚠️ **no** `frontend`: en la raíz del repo esa carpeta no existe).

   Con eso Railway baja únicamente esa carpeta como contexto de build y usa su `Dockerfile`.
   El campo *Railway Config File* puede quedarse en su valor por defecto (`/railway.json`), porque el `railway.json`
   de la raíz ya es común a los dos servicios. Si prefieres apuntarlo explícitamente, recuerda que **no sigue al
   *Root Directory*** y se escribe con la ruta absoluta desde la raíz del repo:
   `/reacttercer/frontend/railway.json`.
2. Variables de entorno del servicio:

   | Variable | Valor |
   | --- | --- |
   | `VITE_API_URL` | `https://<backend>.up.railway.app/api` |
   | `PORT` | lo asigna Railway (el entrypoint de Nginx lo respeta) |

   `VITE_API_URL` se inyecta **en tiempo de build**, por eso el `Dockerfile` la recibe como `ARG`.
3. Genera el dominio público y abre la URL. El SPA carga el catálogo, el login y los paneles.
4. Si cambias la URL del backend, vuelve a desplegar el frontend para recompilar con el nuevo valor.
5. El contexto de construcción es `reacttercer/frontend`, por eso su `.dockerignore` es el que se aplica
   (no el de la raíz del repo).

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

---

## 8. Solución de problemas

### La URL del frontend muestra el backend

**Síntoma:** abres el dominio del servicio de frontend y en lugar del SPA aparece la respuesta de FastAPI
(un JSON como `{"detail":"Not Found"}` o la página de `/docs`).

**Causa:** Railway decide qué construir con el `Dockerfile` del *Root Directory* del servicio, pero el
`railway.json` de la raíz fijaba `dockerfilePath: Dockerfile` y `startCommand: uvicorn backend_fastapi.main:app`
(el backend). Y como el *Railway Config File* **no sigue al *Root Directory***, ese archivo se leía igual aunque el
*Root Directory* fuese `reacttercer/frontend`. Agravante: si un deploy falla, Railway **sigue sirviendo el último
deploy exitoso**, que en ese servicio era el backend: por eso el dominio “no cambia nunca”.

**Solución:** el `railway.json` de la raíz ya no fija `dockerfilePath` ni `startCommand`, así que basta con
`Settings → Source` en el servicio del frontend:

| Campo | Valor |
| --- | --- |
| *Root Directory* | `reacttercer/frontend` |

Luego `Deployments → Redeploy`. Equivalente por CLI:

```bash
railway link
railway environment edit --service-config <servicio-frontend> source.rootDirectory /reacttercer/frontend
```

**Cómo comprobarlo:**

- En `Deployments`, mira si el último deploy está en **verde**. Si está en rojo, Railway sigue sirviendo el deploy
  anterior (el backend) y el dominio parece “congelado”; revisa `Build Logs` y `Deploy Logs` para ver el error.
- En `Deployments → Build Logs`, Railway indica con qué archivo construyó (`Using detected Dockerfile!`). Para el
  frontend deben aparecer rutas `reacttercer/frontend/...`; si aparece el `Dockerfile` de la raíz, el *Root
  Directory* del servicio no está puesto en `reacttercer/frontend`.
- Abre `https://<frontend>.up.railway.app/api/health`: si responde un **JSON** (`{"status":"OK", ...}`) ese
  contenedor es el **backend**; si responde el **HTML del SPA** (o la página con título *Road Master*), es el
  **frontend**. Esta prueba distingue en 5 segundos qué servicio estás viendo.

### La página carga pero el API falla (CORS o peticiones a `localhost:8000`)

El síntoma típico es que al iniciar sesión aparece **“Error al conectar con el servidor.”** Ese mensaje se muestra
cuando la respuesta no trae el campo `error`, lo que ocurre con un 404 de ruta (falta `/api`) o cuando el navegador
bloquea la petición por CORS. `VITE_API_URL` se inyecta **en tiempo de compilación**, no en tiempo de ejecución:

- Debe existir como variable del servicio **frontend** y **terminar en `/api`**: `https://<backend>.up.railway.app/api`.
  Sin ese sufijo el SPA llama a `/auth/login` en lugar de `/api/auth/login` y recibe un 404. Railway entrega las
  variables del servicio como *build args* y el `Dockerfile` ya las declara con `ARG VITE_API_URL`; además
  `frontend/src/api/axios.js` normaliza el sufijo por si se olvida.
- Si cambias su valor hay que **volver a desplegar** el frontend (no basta reiniciar) para recompilar el SPA.
- En el servicio del **backend**, `FRONTEND_ORIGIN` debe listar el origen exacto del frontend, **sin barra final**:
  `https://<frontend>.up.railway.app`. Un `/` final o un `http://` de más rompe la comparación y el navegador
  bloquea la petición por CORS.
- Comprobación desde la terminal (el segundo comando debe imprimir `access-control-allow-origin`):

  ```bash
  curl -s https://<backend>.up.railway.app/api/health
  curl -si -H "Origin: https://<frontend>.up.railway.app" \
    https://<backend>.up.railway.app/api/health | grep -i access-control-allow-origin
  ```

- Truco para saber con qué URL quedó compilado el SPA: el valor de `VITE_API_URL` queda grabado dentro del bundle
  publicado, así que se puede leer directamente del archivo `assets/index-*.js` del frontend.

### El build falla: `couldn't locate the dockerfile at path ...`

Mensaje típico en `Build Logs`:

```
couldn't locate the dockerfile at path reacttercer/frontend in code archive
 - not found at reacttercer/frontend
```

El valor de ese campo es una **carpeta**, no un archivo: falta el nombre del `Dockerfile`. Revisa los campos de
rutas del servicio (y borra la variable `RAILWAY_DOCKERFILE_PATH` si existe):

| Campo | Valor correcto |
| --- | --- |
| `Settings → Source` → *Root Directory* | `reacttercer/frontend` |
| `Settings → Build` → *Dockerfile Path* | vacío (si no se puede vaciar: `/reacttercer/frontend/Dockerfile`) |
| `Settings → Source` → *Railway Config File* | vacío (o `/reacttercer/frontend/railway.json`) |
| Variable `RAILWAY_DOCKERFILE_PATH` | no debe existir (o `/reacttercer/frontend/Dockerfile`) |

Mientras el deploy nuevo esté en rojo, el servicio sigue marcado **Online** sirviendo el deploy anterior (el
backend): eso es lo que hace parecer que “el frontend nunca cambia”. Hay que dejar el build en verde para que el
dominio empiece a mostrar el SPA.

### `Application failed to respond` o error 502

El contenedor de Nginx escucha en `$PORT`, que Railway inyecta automáticamente (`docker-entrypoint.sh` sustituye
`__PORT__` en `nginx.conf`). No definas `PORT` a mano en las variables del servicio ni cambies el puerto de destino
en `Networking`; deja que Railway lo asigne y genera el dominio público.
