# Guía Postman — Cuarto Avance (React + Vite + FastAPI)

Guía paso a paso para probar la API **Road Master** en Postman y tomar las
evidencias (capturas) que exige el cuarto entregable.

---

## 0. Requisitos antes de empezar

1. **XAMPP encendido** con **MySQL** activo (puerto 3306).
2. La base de datos `road_master` debe existir en phpMyAdmin (se crea con `database.sql`).
3. **Backend FastAPI corriendo** en el puerto 8000. Desde la carpeta que contiene `reacttercer`:

   ```powershell
   cd reacttercer
   backend_fastapi\venv\Scripts\python.exe -m uvicorn backend_fastapi.main:app --port 8000
   ```

4. Verifica que responda: abre `http://localhost:8000/docs` en el navegador (debe cargar Swagger).

> No necesitas el frontend para las pruebas de Postman. Se usa solo para las
> capturas de los paneles.

---

## 1. Importar la colección

1. Abre **Postman** (Desktop o Web).
2. Botón **Import** → **Upload Files** → selecciona:
   `reacttercer/postman/road-master-api.postman_collection.json`
3. Aparecerá la colección **Road Master API** con estas carpetas:

   | Carpeta | Requests |
   |---|---|
   | Health | Health |
   | Autenticacion | Login admin, Registro cliente, Login invalido |
   | Usuarios admin | Listar usuarios, Cambiar estado, Consultar, Actualizar, Eliminar, Ruta sin token |
   | Productos | Listar, Crear con imagen, Consultar, Actualizar, Eliminar |
   | Servicios | Listar, Crear, Actualizar, Eliminar |
   | Solicitudes cliente | Solicitudes cliente |

4. Abre la colección → pestaña **Variables**. Verifica que existan:

   | Variable | Valor |
   |---|---|
   | `base_url` | `http://localhost:8000/api` |
   | `token` | (vacío — se llena solo al hacer login) |
   | `usuario_id` | `1` (se llena solo al hacer login) |
   | `producto_id` | `1` (lo actualizas al crear un producto) |
   | `servicio_id` | `1` (lo actualizas al crear un servicio) |

> 💡 El `token` y el `usuario_id` se guardan **automáticamente** cuando ejecutas
> **Login admin** (el request tiene un script que los captura de la respuesta).

---

## 2. Orden de ejecución y capturas

Ejecuta los requests **en este orden** y toma una captura de cada uno.
En la captura debe verse: el **método + URL**, el **Status** (200, 201, 403…)
y el **Body** de respuesta en formato JSON (Pretty).

### Paso 1 — Health (conexión con la base de datos)

- Request: `Health` → **GET** `{{base_url}}/health`
- Esperado: **200** con `{"status": "OK", "mensaje": "Conexión exitosa"}`
- 📸 **Captura**: evidencia de la conexión Backend ↔ Base de datos.

### Paso 2 — Login admin (generación de JWT)

- Request: `Autenticacion > Login admin` → **POST** `{{base_url}}/auth/login`
- Body (ya viene):
  ```json
  {
    "email": "admin@roadmaster.com",
    "password": "Admin123!"
  }
  ```
- Esperado: **200** con `token` (JWT largo) y `usuario` con `rol: "admin"`.
- 📸 **Captura**: evidencia del login y la **generación del JWT**.
- El token queda guardado en la variable `token` automáticamente.

### Paso 3 — Registro de cliente

- Request: `Autenticacion > Registro cliente` → **POST** `{{base_url}}/auth/registro`
- Esperado: **201** con `{"mensaje": "Usuario registrado con éxito"}`.
- ⚠️ Si ya ejecutaste este request antes, devolverá **409** (correo duplicado).
  Cambia el `email` en el body (ej. `postman2@roadmaster.com`) y ejecuta de nuevo.
- 📸 **Captura**: evidencia del registro conectado a la base de datos.

### Paso 4 — Login inválido (respuesta de error)

- Request: `Autenticacion > Login invalido` → **POST** `{{base_url}}/auth/login`
- Esperado: **401** (contraseña incorrecta) o **404** (correo no registrado), con mensaje de error.
- 📸 **Captura**: evidencia de **respuestas de error**.

### Paso 5 — Listar usuarios (endpoint protegido + JWT)

- Request: `Usuarios admin > Listar usuarios` → **GET** `{{base_url}}/usuarios`
- Header `Authorization: Bearer {{token}}` (ya viene configurado).
- Esperado: **200** con el arreglo de usuarios.
- 📸 **Captura**: evidencia de **consulta de usuarios** con token.

### Paso 6 — Consultar un usuario (consulta individual)

- Request: `Usuarios admin > Consultar usuario` → **GET** `{{base_url}}/usuarios/{{usuario_id}}`
- Esperado: **200** con los datos del usuario (el que quedó guardado al hacer login).
- 📸 **Captura**: evidencia de **consulta individual**.

### Paso 7 — Cambiar estado (PATCH)

- Request: `Usuarios admin > Cambiar estado usuario` → **PATCH** `{{base_url}}/usuarios/{{usuario_id}}/estado`
- Body: `{"estado": "inactivo"}`
- Esperado: **200** `{"mensaje": "Estado actualizado correctamente"}`.
- ⚠️ Ejecútalo una vez con `inactivo` (captura) y otra vez con `activo`
  (para no dejar al admin desactivado).
- 📸 **Captura**: evidencia del método **PATCH**.

### Paso 8 — Actualizar usuario (PUT)

- Request: `Usuarios admin > Actualizar usuario` → **PUT** `{{base_url}}/usuarios/{{usuario_id}}`
- Body (ya viene con los datos del admin; puedes cambiar la dirección o el teléfono).
- Esperado: **200** `{"mensaje": "Usuario actualizado correctamente"}`.
- 📸 **Captura**: evidencia del método **PUT** y de **actualización de usuarios**.

### Paso 9 — Endpoint sin token (protección de endpoints)

- Request: `Usuarios admin > Ruta sin token` → **GET** `{{base_url}}/usuarios` (sin header de autorización)
- Esperado: **403** con `{"error": "Acceso denegado: No se proporcionó un token"}`.
- 📸 **Captura**: evidencia de **endpoints protegidos**.

### Paso 10 — Eliminar usuario (DELETE)

- Request: `Usuarios admin > Eliminar usuario` → **DELETE** `{{base_url}}/usuarios/{{usuario_id}}`
- ⚠️ **Cuidado**: elimina al usuario guardado en `usuario_id` (el admin).
  Para la evidencia, primero haz login con un usuario de prueba y después
  elimínalo a él. Sugerencia:
  1. Crea un cliente con **Registro cliente** (Paso 3).
  2. En `Login admin`, cambia las credenciales por el correo y contraseña recién creados y ejecútalo (el `usuario_id` se actualiza solo).
  3. Ejecuta `Eliminar usuario` → **200** `{"mensaje": "Usuario eliminado correctamente"}`.
  4. 📸 **Captura**: evidencia del método **DELETE** y de **eliminación de usuarios**.
  5. Vuelve a poner las credenciales del admin en `Login admin` y ejecútalo para continuar.

### Paso 11 — Listar productos

- Request: `Productos > Listar productos` → **GET** `{{base_url}}/productos`
- Esperado: **200** con el arreglo de productos.
- 📸 **Captura**: evidencia de **consulta de productos**.
- Toma nota de un `id` existente (por si necesitas `producto_id`).

### Paso 12 — Crear producto con imagen (POST multipart)

- Request: `Productos > Crear producto con imagen` → **POST** `{{base_url}}/productos`
- En **Body** (form-data): los campos de texto ya vienen. Para el campo `imagen`:
  1. Pasa el mouse sobre la fila `imagen` → en la columna tipo cambia de **Text** a **File**.
  2. Haz clic en **Select Files** y elige una imagen **JPG, PNG o WEBP** (máx. 5 MB).
- Esperado: **201** con `{"id": X, "mensaje": "Producto creado correctamente"}`.
- Copia el **`id`** de la respuesta y pégalo en la variable `producto_id`
  (Colección → Variables).
- 📸 **Captura**: evidencia de **creación de producto con imagen** y de POST.

### Paso 13 — Consultar producto

- Request: `Productos > Consultar producto` → **GET** `{{base_url}}/productos/{{producto_id}}`
- Esperado: **200** con el producto creado (incluye la URL de la imagen).
- 📸 **Captura**: evidencia de **consulta individual de producto**.

### Paso 14 — Actualizar producto (PUT multipart)

- Request: `Productos > Actualizar producto` → **PUT** `{{base_url}}/productos/{{producto_id}}`
- Body en **form-data** (texto): cambia el nombre, precio o categoría.
- Esperado: **200** `{"mensaje": "Producto actualizado correctamente"}`.
- 📸 **Captura**: evidencia de **actualización de productos** (PUT).

### Paso 15 — Eliminar producto

- Request: `Productos > Eliminar producto` → **DELETE** `{{base_url}}/productos/{{producto_id}}`
- Esperado: **200** `{"mensaje": "Producto eliminado correctamente"}`.
- 📸 **Captura**: evidencia de **eliminación de productos** (DELETE).

### Paso 16 — Servicios (listar / crear / actualizar / eliminar)

- `Servicios > Listar servicios` → **GET** `{{base_url}}/servicios` → **200** 📸
- `Servicios > Crear servicio` → **POST** `{{base_url}}/servicios` → **201**.
  Copia el `id` de la respuesta a la variable `servicio_id`. 📸
- `Servicios > Actualizar servicio` → **PUT** `{{base_url}}/servicios/{{servicio_id}}` → **200** 📸
- `Servicios > Eliminar servicio` → **DELETE** `{{base_url}}/servicios/{{servicio_id}}` → **200** 📸

### Paso 17 — Control de roles (empleado y cliente)

Demuestra que cada rol solo accede a lo suyo:

1. **Cliente**:
   - En `Autenticacion > Login admin`, cambia las credenciales por las del cliente y ejecútalo:
     ```json
     { "email": "cliente@roadmaster.com", "password": "Cliente123!" }
     ```
   - Ejecuta `Solicitudes cliente` → **POST** `{{base_url}}/solicitudes` → **201**.
     (Si da 404, cambia `modeloId` por un `id` real de `Listar productos`.) 📸
   - Ejecuta `Usuarios admin > Listar usuarios` → **403** (el cliente NO puede ver usuarios). 📸
     → evidencia de **control de roles** en el backend.
2. **Empleado**:
   - Cambia las credenciales del login por:
     ```json
     { "email": "empleado@roadmaster.com", "password": "Empleado123!" }
     ```
   - `Servicios > Listar servicios` → **200** (el empleado sí consulta servicios). 📸
   - `Usuarios admin > Listar usuarios` → **403** (pero no administra usuarios). 📸
3. Vuelve a dejar el login con las credenciales del **admin** para los demás pasos.

---

## 3. Evidencias en Swagger (documentación automática)

El entregable pide evidenciar la documentación automática de FastAPI:

1. Abre `http://localhost:8000/docs`.
2. 📸 Captura la página completa (título "Road Master API" + lista de endpoints).
3. Abre **POST /api/auth/login** → **Try it out** → escribe las credenciales del
   admin → **Execute** → captura la respuesta **200** con el token.
4. Abre **GET /api/productos** → **Try it out** → **Execute** → captura el **200** con el listado.

---

## 4. Evidencias de la conexión con la base de datos

1. 📸 Captura `http://localhost:8000/api/health` en el navegador (o la del Paso 1).
2. 📸 En **phpMyAdmin** (`http://localhost/phpmyadmin`) captura:
   - La base `road_master` con sus tablas (usuarios, roles, permisos, productos, servicios, solicitudes).
   - La tabla **usuarios** con una fila donde se vea que la contraseña está **hasheada**
     (cadena larga tipo `$2b$12$...`), no en texto plano.

---

## 5. Evidencias del frontend (opcionales pero recomendadas)

Con el frontend corriendo (`npm run dev` en `reacttercer/frontend`):

1. 📸 Iniciar sesión como admin y capturar el Navbar con **"Bienvenido: [nombre]"**.
2. 📸 Capturar el **Panel de Administrador** (gestión de usuarios/productos/servicios).
3. 📸 Iniciar sesión como empleado y capturar su **panel** (solo solicitudes/servicios).
4. 📸 Iniciar sesión como cliente y capturar su **panel** (perfil + solicitud).

---

## 6. Checklist final de evidencias (vs. el entregable)

| # | Evidencia | Dónde capturarla |
|---|---|---|
| 1 | Conexión con la BD | Health (200) + phpMyAdmin |
| 2 | Registro de usuario | Registro cliente (201) |
| 3 | Inicio de sesión + JWT | Login admin (200 + token) |
| 4 | Consulta de usuarios | Listar usuarios (200) |
| 5 | Consulta individual | Consultar usuario (200) |
| 6 | Actualización de usuarios | Actualizar usuario (PUT 200) |
| 7 | Cambio de estado | Cambiar estado (PATCH 200) |
| 8 | Eliminación de usuarios | Eliminar usuario (DELETE 200) |
| 9 | Consulta de productos | Listar productos (200) |
| 10 | Creación de productos (con imagen) | Crear producto (201) |
| 11 | Actualización de productos | Actualizar producto (PUT 200) |
| 12 | Eliminación de productos | Eliminar producto (DELETE 200) |
| 13 | Servicios (CRUD) | Carpeta Servicios |
| 14 | Solicitud de cliente | Solicitudes cliente (201) |
| 15 | Endpoints protegidos | Ruta sin token (403) |
| 16 | Control de roles | Cliente/empleado → 403 en /usuarios |
| 17 | Respuestas de error | Login inválido (401/404), registro duplicado (409) |
| 18 | Métodos GET, POST, PUT, PATCH, DELETE | Pasos anteriores |
| 19 | Documentación Swagger | `/docs` + Try it out |
| 20 | Contraseñas hasheadas | Tabla usuarios en phpMyAdmin |

---

## 7. Consejos para las capturas

- Muestra siempre el **Status code** y el **Body en Pretty/JSON** en la captura.
- Con **Ctrl + Shift + P** en Postman puedes cambiar el tema para mejor contraste.
- No captures contraseñas en texto plano en el Body de los requests si lo evitas
  fácilmente; el entregable sí permite mostrarlas en el login, pero es mejor
  evidencia si solo se ve la contraseña hasheada en la BD.
- Guarda las capturas en una carpeta `Evidencias cuarto entregable/` con nombres
  descriptivos: `01-health.png`, `02-login-jwt.png`, etc.
- Si algo falla, revisa que el backend esté corriendo en el 8000 y que el
  `base_url` de la colección sea `http://localhost:8000/api`.