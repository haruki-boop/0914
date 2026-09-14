const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data', 'board.json');
const DEFAULT_COLUMNS = ['todo', 'doing', 'done'];

function loadBoard() {
  if (!fs.existsSync(DATA_FILE)) {
    return { cards: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveBoard(board) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(board, null, 2));
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/cards', (req, res) => {
  res.json(loadBoard().cards);
});

app.post('/api/cards', (req, res) => {
  const { title, column } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const board = loadBoard();
  const card = {
    id: crypto.randomUUID(),
    title: title.trim(),
    column: DEFAULT_COLUMNS.includes(column) ? column : 'todo',
    createdAt: new Date().toISOString(),
  };
  board.cards.push(card);
  saveBoard(board);
  res.status(201).json(card);
});

app.patch('/api/cards/:id', (req, res) => {
  const board = loadBoard();
  const card = board.cards.find((c) => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: 'not found' });

  const { column, title } = req.body;
  if (column !== undefined) {
    if (!DEFAULT_COLUMNS.includes(column)) {
      return res.status(400).json({ error: 'invalid column' });
    }
    card.column = column;
  }
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'invalid title' });
    }
    card.title = title.trim();
  }
  saveBoard(board);
  res.json(card);
});

app.delete('/api/cards/:id', (req, res) => {
  const board = loadBoard();
  const before = board.cards.length;
  board.cards = board.cards.filter((c) => c.id !== req.params.id);
  if (board.cards.length === before) return res.status(404).json({ error: 'not found' });
  saveBoard(board);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kanban board running at http://localhost:${PORT}`);
});
