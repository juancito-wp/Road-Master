#!/bin/sh
set -e

# La plataforma cloud asigna el puerto en la variable PORT (80 por defecto en local).
PORT="${PORT:-80}"
sed "s/__PORT__/${PORT}/g" /etc/nginx/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
