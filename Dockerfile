FROM oven/bun:1 AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---------- build ----------
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/docs ./docs
# Sumber yang dibaca saat runtime: app/docs menyaji-kan folder docs/,
# drizzle-kit push membaca drizzle.config.ts + src/db/schema.ts
COPY package.json drizzle.config.ts tsconfig.json next.config.ts ./
COPY src ./src
COPY app ./app
EXPOSE 3000

# Sinkronkan skema dulu, baru serve. --force supaya statement data-loss
# (mis. drop kolom) gak nyangkut di prompt interaktif saat boot di server.
CMD ["sh", "-c", "bunx drizzle-kit push --force && bun run start"]
