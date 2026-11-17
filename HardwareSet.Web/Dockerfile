# Estágio 1: Build do React / TypeScript (Vite)
FROM node:22-alpine AS build
WORKDIR /app

COPY ["HardwareSet.Web/package.json", "HardwareSet.Web/package-lock.json", "./"]
RUN npm ci

COPY ["HardwareSet.Web/", "./"]
ARG VITE_GATEWAY_URL=http://localhost:5000
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
RUN npm run build

# Estágio 2: Servidor Nginx leve para produção
FROM nginx:stable-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY ["HardwareSet.Web/nginx.conf", "/etc/nginx/conf.d/default.conf"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
