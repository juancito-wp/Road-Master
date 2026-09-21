# Imagen del frontend React + Vite (Road Master - quinto avance)
# El contexto de construcción es la carpeta frontend:
#   docker build --build-arg VITE_API_URL=https://tu-api.up.railway.app/api -t road-master-web .
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .

# URL pública del backend FastAPI, configurada como variable de entorno en el proveedor cloud.
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
