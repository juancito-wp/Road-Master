# Backend FastAPI

## Instalación en Windows

```powershell
cd reacttercer
python -m venv backend_fastapi\venv
backend_fastapi\venv\Scripts\activate
pip install -r backend_fastapi\requirements.txt
Copy-Item backend_fastapi\.env.example backend_fastapi\.env
```

Si PowerShell bloquea la activación por política de scripts, puedes ejecutar el backend sin activar el entorno:

```powershell
backend_fastapi\venv\Scripts\python.exe -m uvicorn backend_fastapi.main:app --reload --port 8000
```

Configura `DATABASE_URL` y `JWT_SECRET` en `backend_fastapi/.env`. La base de datos y sus tablas se crean con `database.sql`.

Para recuperación real de contraseña, configura también `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y `SMTP_FROM`. El sistema envía un código de seis dígitos que vence en 10 minutos. En Gmail debes usar una contraseña de aplicación, no la contraseña personal de la cuenta.

## Ejecución

Desde la carpeta que contiene `reacttercer`:

```powershell
uvicorn backend_fastapi.main:app --reload --port 8000
```

El comando anterior debe ejecutarse con el entorno virtual activado. La alternativa sin activarlo es:

```powershell
backend_fastapi\venv\Scripts\python.exe -m uvicorn backend_fastapi.main:app --reload --port 8000
```

Documentación automática: `http://127.0.0.1:8000/docs`.
