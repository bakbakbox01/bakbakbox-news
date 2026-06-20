# Stage 1 — Build Angular application
FROM node:22-alpine AS build

WORKDIR /app

ARG NG_APP_API_URL=/api
ENV NG_APP_API_URL=$NG_APP_API_URL

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# Stage 2 — Serve with Nginx
FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/bakbakbox-client/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
