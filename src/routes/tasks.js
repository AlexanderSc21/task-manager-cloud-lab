const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Guardaremos las tareas en la memoria temporal en lugar de un archivo
let tasks = [];

router.get('/', (req, res) => {
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    dueDate: dueDate || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.json(newTask);
});

router.delete('/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;