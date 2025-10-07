FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install ci

COPY . .

RUN npm run generate
RUN npm run build

RUN ls -la /app

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:prod && node dist/main"]
