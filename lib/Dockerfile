FROM mcr.microsoft.com/playwright:v1.49.1 AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY playwright.config.ts ./
COPY astro.config.mjs ./
COPY tsconfig.json ./
COPY package.json ./
COPY tests ./tests
COPY playground ./playground
COPY src ./src

CMD ["sh", "-c", "xvfb-run pnpm run test -u"]
