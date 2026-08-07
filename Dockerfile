FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS builder

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

FROM base AS dependencies

# node-linker=hoisted produces a flat, symlink-free node_modules so the tree can
# be copied verbatim into the distroless runtime image.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts --config.node-linker=hoisted

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS release

WORKDIR /app
USER nonroot

COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD export TBA_API_KEY="dummy" && echo '{ "jsonrpc": "2.0", "id": "123", "method": "ping" }' | \
    ./dist/index.js | grep -q '"result": {}' || exit 1

CMD ["dist/index.js"]
