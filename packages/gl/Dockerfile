FROM mcr.microsoft.com/playwright:v1.49.1
RUN npm install -g corepack@latest
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./

COPY packages/gl/package.json ./packages/gl/
COPY packages/helpers/package.json ./packages/helpers/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY packages/gl ./packages/gl
COPY packages/helpers ./packages/helpers

WORKDIR /app/packages/gl

EXPOSE 9323

CMD ["sh", "-c", "xvfb-run pnpm run test"]
