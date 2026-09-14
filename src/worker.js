import { Hono } from 'hono';

const COLUMNS = ['todo', 'doing', 'done'];
const CARDS_KEY = 'cards';

async function loadCards(kv) {
  const raw = await kv.get(CARDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveCards(kv, cards) {
  await kv.put(CARDS_KEY, JSON.stringify(cards));
}

const app = new Hono();

app.get('/api/cards', async (c) => {
  const cards = await loadCards(c.env.BOARD_KV);
  return c.json(cards);
});

app.post('/api/cards', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, column } = body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return c.json({ error: 'title is required' }, 400);
  }
  const cards = await loadCards(c.env.BOARD_KV);
  const card = {
    id: crypto.randomUUID(),
    title: title.trim(),
    column: COLUMNS.includes(column) ? column : 'todo',
    createdAt: new Date().toISOString(),
  };
  cards.push(card);
  await saveCards(c.env.BOARD_KV, cards);
  return c.json(card, 201);
});

app.patch('/api/cards/:id', async (c) => {
  const id = c.req.param('id');
  const cards = await loadCards(c.env.BOARD_KV);
  const card = cards.find((cd) => cd.id === id);
  if (!card) return c.json({ error: 'not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const { column, title } = body;
  if (column !== undefined) {
    if (!COLUMNS.includes(column)) return c.json({ error: 'invalid column' }, 400);
    card.column = column;
  }
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) return c.json({ error: 'invalid title' }, 400);
    card.title = title.trim();
  }
  await saveCards(c.env.BOARD_KV, cards);
  return c.json(card);
});

app.delete('/api/cards/:id', async (c) => {
  const id = c.req.param('id');
  const cards = await loadCards(c.env.BOARD_KV);
  const next = cards.filter((cd) => cd.id !== id);
  if (next.length === cards.length) return c.json({ error: 'not found' }, 404);
  await saveCards(c.env.BOARD_KV, next);
  return c.body(null, 204);
});

export default app;
