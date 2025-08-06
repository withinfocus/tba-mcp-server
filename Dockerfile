FROM node:24-slim AS builder

WORKDIR /app

COPY . /app
COPY tsconfig.json /tsconfig.json

RUN --mount=type=cache,target=/root/.npm npm install
RUN --mount=type=cache,target=/root/.npm-production npm ci --ignore-scripts --omit-dev

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS release

WORKDIR /app
USER nonroot

COPY --from=builder /app/ /app/

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD echo '{ "jsonrpc": "2.0", "id": "123", "method": "ping" }' | \
    ./dist/index.js | grep -q '"result": {}' || exit 1

CMD ["dist/index.js"]
