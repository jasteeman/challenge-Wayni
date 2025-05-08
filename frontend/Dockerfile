# Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# Etapa de producción con Nginx
FROM nginx:alpine AS stage-1

# Copiar archivos compilados al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar Nginx para que maneje correctamente rutas del frontend
RUN printf "server {\n\
  listen 80;\n\
  server_name localhost;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  location / {\n\
    try_files \$uri /index.html;\n\
  }\n\
\n\
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
    try_files \$uri =404;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
