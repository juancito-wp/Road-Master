# Dockerfile del backend FastAPI (Road Master)
# Ubicado en la RAIZ del repositorio porque Railway usa la raiz del repo como
# contexto de construccion por defecto. El codigo vive en reacttercer/backend_fastapi.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY reacttercer/backend_fastapi/requirements.txt ./backend_fastapi/requirements.txt
RUN pip install --upgrade pip && pip install -r backend_fastapi/requirements.txt

COPY reacttercer/backend_fastapi ./backend_fastapi

# Carpeta de imagenes subidas por el administrador (persistir con un volumen en produccion).
RUN mkdir -p /app/backend_fastapi/uploads

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend_fastapi.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
