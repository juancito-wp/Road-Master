# Imagen del backend FastAPI (Road Master - quinto avance)
# El contexto de construcción debe ser la raíz del proyecto:
#   docker build -f backend_fastapi/Dockerfile -t road-master-api .
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend_fastapi/requirements.txt ./backend_fastapi/requirements.txt
RUN pip install --upgrade pip && pip install -r backend_fastapi/requirements.txt

COPY backend_fastapi ./backend_fastapi

# Carpeta de imágenes subidas por el administrador (persistir con un volumen en producción).
RUN mkdir -p /app/backend_fastapi/uploads

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend_fastapi.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
