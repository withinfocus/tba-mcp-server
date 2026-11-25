FROM node:26-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Node 26 no longer bundles corepack, so install the pnpm version pinned in
# package.json's packageManager field with npm. hadolint can't see that pin.
# hadolint ignore=DL3016
RUN npm install -g "$(node -p "require('./package.json').packageManager.split('+')[0]")"

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

FROM gcr.io/distroless/nodejs26-debian13:nonroot AS release

WORKDIR /app
USER nonroot

COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./

COPY docker/healthcheck.mjs ./docker/healthcheck.mjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["/nodejs/bin/node", "docker/healthcheck.mjs"]

CMD ["dist/index.js"]
