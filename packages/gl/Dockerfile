FROM mcr.microsoft.com/playwright:v1.49.1
RUN npm install -g corepack@latest

WORKDIR /app

COPY --from=workspace pnpm-lock.yaml pnpm-workspace.yaml ./

COPY package.json ./packages/gl/
COPY --from=helpers package.json ./packages/helpers/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . ./packages/gl
COPY --from=helpers . ./packages/helpers

WORKDIR /app/packages/gl

RUN corepack enable
RUN corepack prepare --activate

EXPOSE 9323

CMD ["sh", "-c", "xvfb-run pnpm run test"]
