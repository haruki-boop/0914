# Kanban Board

Minimal self-hosted kanban-style task board. Node.js + Express backend with
JSON-file persistence, vanilla JS frontend with drag-and-drop.

## Run

```
npm install
npm start
```

Then open http://localhost:3000

## API

- `GET /api/cards` — list all cards
- `POST /api/cards` `{ title, column }` — create a card
- `PATCH /api/cards/:id` `{ title?, column? }` — update a card
- `DELETE /api/cards/:id` — delete a card

Columns: `todo`, `doing`, `done`.
