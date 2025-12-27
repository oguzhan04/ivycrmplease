const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const Task = require('../models/Task');
const Student = require('../models/Student');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get all tasks (admin sees all, counsellors see only their tasks)
router.get('/', authenticate, async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role !== 'admin') {
      whereClause.assignedToId = req.user.id;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          association: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await Task.findByPk(taskId, {
      include: [
        {
          association: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Create new task
router.post('/', authenticate, [
  body('title').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, dueDate, assignedToId, studentId } = req.body;

    // If assignedToId not provided, assign to creator (unless admin assigns to someone else)
    const assignedTo = assignedToId || (req.user.role === 'counsellor' ? req.user.id : null);

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      assignedToId: assignedTo,
      createdById: req.user.id,
      studentId
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          association: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      studentId: req.body.studentId
    };

    // Only admin can reassign tasks
    if (req.user.role === 'admin' && req.body.assignedToId) {
      updateData.assignedToId = req.body.assignedToId;
    }

    // Mark as completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    } else if (req.body.status !== 'completed') {
      updateData.completedAt = null;
    }

    await task.update(updateData);

    const updatedTask = await Task.findByPk(taskId, {
      include: [
        {
          association: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task (admin only, or creator)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;

