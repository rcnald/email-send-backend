# Etapa 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Dependências mínimas pro Alpine + Prisma
RUN apk add --no-cache libc6-compat openssl

# Habilita o corepack (pra usar Yarn moderno)
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia apenas os manifests primeiro (cache)
COPY package.json yarn.lock ./

# Instala dependências (Yarn 4 usa --immutable no lugar de --frozen-lockfile)
RUN yarn install --immutable

# Copia o restante do projeto
COPY . .

# Build da aplicação
RUN yarn build

# Etapa 2: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Dependências mínimas pro runtime
RUN apk add --no-cache libc6-compat openssl

# Ativa novamente o corepack (garante Yarn 4 no runtime também)
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia só o que precisa
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json yarn.lock ./

# Porta esperada pelo Render
EXPOSE 8080

# Rodar migrations antes de startar a API
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start"]
