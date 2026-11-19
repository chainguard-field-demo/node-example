# syntax=docker/dockerfile:1

# ---- Build stage: full toolchain (shell, npm) ----
FROM cgr.dev/chainguard/node:latest-dev AS build
WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
# Optional npmrc secret (e.g. Chainguard Libraries registry + token).
# Pass with: docker build --secret id=npmrc,src=$HOME/.npmrc .
RUN --mount=type=secret,id=npmrc,uid=65532,required=false \
    if [ -f /run/secrets/npmrc ]; then export NPM_CONFIG_USERCONFIG=/run/secrets/npmrc; fi; \
    npm ci

COPY --chown=node:node angular.json tsconfig.json tsconfig.app.json server.js ./
COPY --chown=node:node src ./src
RUN npm run build && npm prune --omit=dev

# ---- Runtime stage: minimal, no shell, runs as non-root ----
FROM cgr.dev/chainguard/node:latest
WORKDIR /app
ENV NODE_ENV=production PORT=8080

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server.js /app/package.json ./

EXPOSE 8080
CMD ["server.js"]
