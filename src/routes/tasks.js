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
  const tasks = readTasks().filter(t => t.userId === req.session.user.id);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const tasks = readTasks();
  const newTask = {
    id: uuidv4(),
    userId: req.session.user.id,
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

router.put('/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, dueDate, status } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (status !== undefined) task.status = status;

  writeTasks(tasks);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  let tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id && t.userId === req.session.user.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  writeTasks(tasks);
  res.json({ success: true });
});

module.exports = router;
