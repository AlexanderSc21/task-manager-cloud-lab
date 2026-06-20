const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const tasksFile = path.join(__dirname, '..', 'data', 'tasks.json');

function readTasks() {
  const data = fs.readFileSync(tasksFile, 'utf8');
  return JSON.parse(data);
}

function writeTasks(tasks) {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

router.get('/', (req, res) => {
  res.json(readTasks());
});

router.post('/', (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const tasks = readTasks();
  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    dueDate: dueDate || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.json(newTask);
});

router.delete('/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  writeTasks(tasks);
  res.json({ success: true });
});

module.exports = router;
