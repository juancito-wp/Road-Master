# Pruebas Postman de Road Master

## ¿Debo instalar una extensión?

No. No necesitas una extensión de VS Code ni instalar otra dependencia del proyecto. Instala **Postman Desktop** desde https://www.postman.com/downloads/ o usa Postman Web.

Antes de probar:

1. Inicia MySQL en XAMPP.
2. Verifica que la base `road_master` exista en phpMyAdmin.
3. Inicia FastAPI desde la carpeta que contiene `reacttercer`:

```powershell
uvicorn backend_fastapi.main:app --reload --port 8000
```

El backend debe responder en `http://localhost:8000` y la documentación en `http://localhost:8000/docs`.

## Importar la colección

1. Abre Postman.
2. Selecciona **Import**.
3. Elige `postman/road-master-api.postman_collection.json` (esta es la colección para FastAPI en el puerto 8000). La otra (`Road-Master.postman_collection.json`) es de una versión anterior del backend en Node.
4. Abre la colección y ejecuta primero **01 Health MySQL**.
5. Ejecuta **02 Autenticación > Login Admin**.
6. El token quedará guardado automáticamente para las solicitudes protegidas.

## Usuarios de prueba

- Admin: `admin@roadmaster.com` / `Admin123!`
- Empleado: `empleado@roadmaster.com` / `Empleado123!`
- Cliente: `cliente@roadmaster.com` / `Cliente123!`

Para probar permisos diferentes, cambia las credenciales del request **Login Admin** y ejecuta el login otra vez. Un empleado puede consultar servicios, pero no administrar usuarios ni productos. Un cliente puede crear solicitudes, pero no acceder a usuarios.

## Probar imagen de producto

En las variables de la colección, edita `imagen_path` y selecciona la ruta completa de una imagen local, por ejemplo:

```text
C:\Users\Valeria\Pictures\modelo.png
```

También puedes abrir **04 Productos > Crear producto con imagen**, ir a **Body**, seleccionar el campo `imagen` y elegir **Select Files**. Usa JPG, PNG o WEBP de máximo 5 MB.

Después de crear el producto, copia el `id` de la respuesta y actualiza la variable `producto_id` antes de ejecutar actualizar o eliminar.

## Evidencias para entregar

Toma capturas donde se vean:

- `01 Health MySQL` con respuesta 200.
- Login exitoso y token JWT.
- Registro exitoso con respuesta 201.
- Consulta de usuarios autorizada.
- Creación de producto con imagen.
- Una actualización y una eliminación.
- Solicitud sin token con respuesta 401 o 403.
- Error de datos inválidos con respuesta 400.
