# Etapa 1: Build
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Ativa corepack e força Yarn 4.x
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia só manifestos primeiro (cache eficiente)
COPY package.json yarn.lock .yarnrc.yml ./

# Instala dependências
RUN yarn install --immutable

# Copia o restante do código depois
COPY . .

# Agora sim, builda
RUN yarn build

# Etapa 2: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare yarn@4.4.0 --activate

# Copia dependências já resolvidas
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json yarn.lock .yarnrc.yml ./

EXPOSE 8080

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start"]
