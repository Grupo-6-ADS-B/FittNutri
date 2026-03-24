# Stage 1 — Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Stage 2 — Serve (nginx leve, sem Node.js em produção)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Configuração para React Router (rotas SPA)
RUN printf 'server {\n\
    listen 5173;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
