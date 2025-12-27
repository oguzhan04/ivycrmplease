const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

// Get all meetings (admin sees all, counsellors see only their students' meetings)
router.get('/', authenticate, async (req, res) => {
  try {
    const whereClause = {};
    
    // If not admin, filter by assigned students
    if (req.user.role !== 'admin') {
      const user = await require('../models/User').findByPk(req.user.id, {
        include: [{
          association: 'students',
          attributes: ['id']
        }]
      });
      const studentIds = user.students?.map(s => s.id) || [];
      if (studentIds.length === 0) {
        return res.json([]);
      }
      whereClause.studentId = studentIds;
    }

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['meetingDate', 'DESC']]
    });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
});

// Get meetings by student ID
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    
    // Check access
    if (req.user.role !== 'admin') {
      const user = await require('../models/User').findByPk(req.user.id, {
        include: [{
          association: 'students',
          where: { id: studentId },
          attributes: ['id']
        }]
      });
      if (!user.students || user.students.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const meetings = await Meeting.findAll({
      where: { studentId },
      include: [
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['meetingDate', 'DESC']]
    });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
});

// Get meetings by date range (for calendar/schedule view)
router.get('/date-range', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const whereClause = {
      meetingDate: {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    // Filter by assigned students if not admin
    if (req.user.role !== 'admin') {
      const user = await require('../models/User').findByPk(req.user.id, {
        include: [{
          association: 'students',
          attributes: ['id']
        }]
      });
      const studentIds = user.students?.map(s => s.id) || [];
      if (studentIds.length === 0) {
        return res.json([]);
      }
      whereClause.studentId = studentIds;
    }

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['meetingDate', 'ASC']]
    });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
});

// Create new meeting/note
router.post('/', authenticate, [
  body('studentId').isInt(),
  body('meetingDate').isISO8601(),
  body('notes').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, meetingDate, notes, isImportant } = req.body;

    // Check access
    if (req.user.role !== 'admin') {
      const user = await require('../models/User').findByPk(req.user.id, {
        include: [{
          association: 'students',
          where: { id: studentId },
          attributes: ['id']
        }]
      });
      if (!user.students || user.students.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const meeting = await Meeting.create({
      studentId,
      meetingDate,
      notes,
      isImportant: isImportant || false,
      createdById: req.user.id
    });

    const createdMeeting = await Meeting.findByPk(meeting.id, {
      include: [
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json(createdMeeting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting', error: error.message });
  }
});

// Update meeting
router.put('/:id', authenticate, [
  body('notes').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meetingId = parseInt(req.params.id);
    const meeting = await Meeting.findByPk(meetingId, {
      include: [{
        association: 'student',
        include: [{
          association: 'counsellors',
          attributes: ['id']
        }]
      }]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check access
    if (req.user.role !== 'admin') {
      const hasAccess = meeting.student.counsellors?.some(c => c.id === req.user.id);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await meeting.update({
      meetingDate: req.body.meetingDate,
      notes: req.body.notes,
      isImportant: req.body.isImportant
    });

    const updatedMeeting = await Meeting.findByPk(meetingId, {
      include: [
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          association: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting', error: error.message });
  }
});

// Delete meeting
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const meeting = await Meeting.findByPk(meetingId, {
      include: [{
        association: 'student',
        include: [{
          association: 'counsellors',
          attributes: ['id']
        }]
      }]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && meeting.createdById !== req.user.id) {
      const hasAccess = meeting.student.counsellors?.some(c => c.id === req.user.id);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await meeting.destroy();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting', error: error.message });
  }
});

module.exports = router;

