# Etapa 1: Build
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Ativa corepack e força Yarn 4.x
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia apenas manifestos (cache eficiente)
COPY package.json yarn.lock .yarnrc.yml ./

# Instala dependências
RUN yarn install --immutable

# Copia todo o projeto
COPY . .

# Gera os tipos do Prisma antes do build
RUN yarn prisma generate

# Agora sim, builda o TS
RUN yarn build

# Etapa 2: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia dependências e artefatos
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json yarn.lock .yarnrc.yml ./

# Copia também assets/docs/public
COPY --from=build /app/docs ./docs


# Porta esperada pelo Render
EXPOSE 8080

# Rodar migrations antes de iniciar a API
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start"]
