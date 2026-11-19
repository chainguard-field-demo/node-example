# node-example

Example application showing the Chainguard Node image: a "Hello, World!" Angular
front end served by an Express backend, built and run entirely on Chainguard images.

## What's inside

| Path | Purpose |
| --- | --- |
| `src/` | Angular app (one standalone component that calls the API) |
| `server.js` | Express server: serves the built Angular files, `/api/hello`, `/healthz` |
| `angular.json`, `tsconfig*.json` | Angular build config (output: `dist/web/browser`) |
| `Dockerfile` | Two-stage build on Chainguard Node images |

### Endpoints

| Route | Response |
| --- | --- |
| `/` | The Angular app |
| `/api/hello` | JSON greeting, including the Node version the server runs on |
| `/healthz` | `ok` |
| any other GET | The Angular app, so client-side routes resolve |

## Container build

The `Dockerfile` uses two Chainguard images:

- **Build stage:** `cgr.dev/chainguard/node:latest-dev` has a shell and npm. It runs
  `npm ci`, builds the Angular app, then removes dev dependencies.
- **Runtime stage:** `cgr.dev/chainguard/node:latest` is minimal: no shell, no package
  manager, runs as a non-root user (UID 65532). It contains only the server, the built
  front end and the production `node_modules`.

Build and run:

```sh
docker build -t node-example .
docker run --rm -p 8080:8080 node-example
```

Then open http://localhost:8080.

### Using a private npm registry (e.g. Chainguard Libraries)

The dependencies in `package-lock.json` currently resolve from the public npm registry.
To install from Chainguard Libraries instead, configure npm by following the
[Chainguard Libraries for JavaScript setup](https://www.chainguard.dev/docs/chainguard/libraries/javascript/build-configuration),
regenerate `package-lock.json`, and pass your npm config to the build as a secret:

```sh
docker build --secret id=npmrc,src=$HOME/.npmrc -t node-example .
```

The secret is only mounted for the `npm ci` step, so your credentials aren't saved in
any image layer. Without the secret, the build uses npm's default registry.

## Local development

Requires Node.js and npm.

```sh
npm ci
npm run build   # builds Angular into dist/web/browser
npm start       # serves on http://localhost:8080 (set PORT to change)
```

`npm run dev` runs both steps.
