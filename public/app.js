const columns = ['todo', 'doing', 'done'];
const lists = Object.fromEntries(
  columns.map((c) => [c, document.querySelector(`.card-list[data-column="${c}"]`)])
);

async function fetchCards() {
  const res = await fetch('/api/cards');
  const cards = await res.json();
  renderCards(cards);
}

function renderCards(cards) {
  columns.forEach((c) => { lists[c].innerHTML = ''; });
  for (const card of cards) {
    const el = createCardElement(card);
    (lists[card.column] || lists.todo).appendChild(el);
  }
}

function createCardElement(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.id;

  const title = document.createElement('span');
  title.textContent = card.title;

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.textContent = '×';
  del.title = '削除';
  del.addEventListener('click', () => deleteCard(card.id));

  el.appendChild(title);
  el.appendChild(del);

  el.addEventListener('dragstart', () => {
    el.classList.add('dragging');
    el.dataset.dragging = 'true';
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
  });

  return el;
}

for (const column of columns) {
  const list = lists[column];
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    list.classList.add('drag-over');
  });
  list.addEventListener('dragleave', () => {
    list.classList.remove('drag-over');
  });
  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    list.classList.remove('drag-over');
    const dragging = document.querySelector('.card.dragging');
    if (!dragging) return;
    const id = dragging.dataset.id;
    list.appendChild(dragging);
    await moveCard(id, column);
  });
}

async function addCard(title) {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, column: 'todo' }),
  });
  if (res.ok) fetchCards();
}

async function moveCard(id, column) {
  await fetch(`/api/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column }),
  });
}

async function deleteCard(id) {
  await fetch(`/api/cards/${id}`, { method: 'DELETE' });
  fetchCards();
}

document.getElementById('new-card-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('new-card-title');
  const title = input.value.trim();
  if (!title) return;
  input.value = '';
  addCard(title);
});

fetchCards();
