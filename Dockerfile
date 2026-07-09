# ─── Build stage ───────────────────────────────────────────────
FROM node:20-slim AS build
RUN apt-get update -qq && apt-get install -y -qq python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:./ryde.db
RUN npm run db:migrate && BUILD_WORKER=1 npx next build

# ─── Runner stage ──────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 ryde && \
    useradd --system --uid 1001 --gid 1001 ryde

COPY --from=build --chown=ryde:ryde /app/public ./public
COPY --from=build --chown=ryde:ryde /app/.next ./.next
COPY --from=build --chown=ryde:ryde /app/drizzle ./drizzle
COPY --from=build --chown=ryde:ryde /app/node_modules ./node_modules
COPY --from=build --chown=ryde:ryde /app/package.json ./package.json
COPY --from=build --chown=ryde:ryde /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build --chown=ryde:ryde /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data && chown ryde:ryde /app/data

USER ryde

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
CMD []
