FROM mcr.microsoft.com/playwright:v1.49.1
RUN npm install -g corepack@latest
RUN corepack enable

WORKDIR /app

COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY playwright.config.ts astro.config.mjs tsconfig.json ./
COPY tests ./tests
COPY playground ./playground
COPY src ./src

EXPOSE 9323

CMD ["sh", "-c", "xvfb-run pnpm run test"]
