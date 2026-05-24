# RAVA frontend — build the Vite SPA, then serve it with nginx and reverse-proxy
# /api to the backend so the whole app is single-origin (needed for the session
# cookie and the Yandex OAuth redirect).

# ── build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── serve ────────────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
