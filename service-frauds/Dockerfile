FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install ci

COPY . .

RUN npm run build

RUN ls -la /app

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "node dist/main"]
