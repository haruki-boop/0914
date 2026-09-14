# Kanban Board

Minimal kanban-style task board with a vanilla JS drag-and-drop frontend.
Two interchangeable backends share the same API and frontend:

- `server.js` — Node.js + Express, JSON-file persistence (local dev)
- `src/worker.js` — Cloudflare Workers + Hono, KV persistence (cloud deploy)

## Run locally (Node.js)

```
npm install
npm start
```

Then open http://localhost:3000

## Run locally (Cloudflare Workers simulator)

```
npm install
npm run dev:worker
```

## Deploy to Cloudflare

```
npx wrangler login
npx wrangler kv namespace create BOARD_KV
# copy the returned id into wrangler.toml under [[kv_namespaces]]
npm run deploy
```

## API

- `GET /api/cards` — list all cards
- `POST /api/cards` `{ title, column }` — create a card
- `PATCH /api/cards/:id` `{ title?, column? }` — update a card
- `DELETE /api/cards/:id` — delete a card

Columns: `todo`, `doing`, `done`.
