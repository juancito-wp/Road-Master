# Backend FastAPI

## Instalación en Windows

```powershell
cd reacttercer
python -m venv ..\.venv
..\.venv\Scripts\activate
pip install -r backend_fastapi\requirements.txt
Copy-Item backend_fastapi\.env.example backend_fastapi\.env
```

Si PowerShell bloquea la activación por política de scripts, puedes ejecutar el backend sin activar el entorno:

```powershell
..\.venv\Scripts\python.exe -m uvicorn backend_fastapi.main:app --reload --port 8000
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
..\.venv\Scripts\python.exe -m uvicorn backend_fastapi.main:app --reload --port 8000
```

Documentación automática: `http://127.0.0.1:8000/docs`.

## Quinto avance: ventas, facturación, reportes, PQR y chatbot con IA

El backend incorpora los módulos comerciales sobre la misma arquitectura del cuarto avance:

- **Ventas y detalle de ventas**: `backend_fastapi/routers/ventas.py`.
- **Facturación (con PDF)**: `backend_fastapi/routers/facturas.py`.
- **Reportes diarios en PDF y Excel**: `backend_fastapi/routers/reportes.py` (reportlab + openpyxl).
- **PQR**: `backend_fastapi/routers/pqr.py`.
- **Chatbot con IA y respaldo local**: `backend_fastapi/routers/chatbot.py` y `backend_fastapi/services/ia.py`.
- **Estadísticas de los dashboards**: `backend_fastapi/routers/estadisticas.py`.

Dependencias nuevas: `reportlab` (PDF), `openpyxl` (Excel), `pillow` (logo en los documentos) y `gunicorn` (despliegue).

Los PDF de facturas y reportes diarios, y el Excel del reporte, incluyen el logo del proyecto (`backend_fastapi/assets/logo_road_master.png`).

Actualiza la base de datos con el script ampliado (solo crea las tablas que falten):

```powershell
mysql -u root -p road_master < database.sql
```

Variables de entorno nuevas en `backend_fastapi/.env` (ver `.env.example`): `IMPUESTO_PORCENTAJE`,
`OPENAI_API_KEY`, `OPENAI_MODEL`, `PUBLIC_FRONTEND_URL` y `FRONTEND_ORIGIN` (admite varios orígenes
separados por coma para el despliegue). Sin `OPENAI_API_KEY` el chatbot responde en modo local
con el catálogo real, de modo que el sitio nunca queda sin atención.

### Pruebas automatizadas

```powershell
..\.venv\Scripts\python.exe -m backend_fastapi.tests.test_quinto_avance
```

Crea datos temporales con el correo `prueba.quinto...@roadmaster.test` y los elimina al terminar
(37 verificaciones de ventas, facturas, reportes PDF/Excel, PQR, chatbot y estadísticas).

Documentación ampliada: `docs/QUINTO-AVANCE.md` (funcionalidades y endpoints) y `docs/DESPLIEGUE.md`
(despliegue en la nube).
