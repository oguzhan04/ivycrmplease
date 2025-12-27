const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get all students (admin sees all, counsellors see only their assigned students)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const students = await Student.findAll({
        include: [{
          association: 'counsellors',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json(students);
    } else {
      // Counsellors see only their assigned students
      const user = await User.findByPk(req.user.id, {
        include: [{
          association: 'students',
          include: [{
            association: 'counsellors',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }]
      });
      return res.json(user.students || []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get student by ID (admin can access any, counsellors only their assigned)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await Student.findByPk(studentId, {
      include: [{
        association: 'counsellors',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if counsellor has access to this student
    if (req.user.role !== 'admin') {
      const hasAccess = student.counsellors.some(c => c.id === req.user.id);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

// Create new student
router.post('/', authenticate, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      firstName, 
      lastName, 
      parentName,
      contactInfo,
      email, 
      phone, 
      leadStatus,
      serviceType,
      price,
      feePerYear,
      school,
      notes, 
      counsellorIds 
    } = req.body;

    const student = await Student.create({
      firstName,
      lastName,
      parentName,
      contactInfo,
      email,
      phone,
      leadStatus: leadStatus || 'prospect',
      serviceType,
      price,
      feePerYear,
      school,
      notes,
      createdBy: req.user.id
    });

    // Assign counsellors if provided
    if (counsellorIds && Array.isArray(counsellorIds)) {
      await student.setCounsellors(counsellorIds);
    } else if (req.user.role === 'counsellor') {
      // Auto-assign to creating counsellor if not admin
      await student.setCounsellors([req.user.id]);
    }

    const createdStudent = await Student.findByPk(student.id, {
      include: [{
        association: 'counsellors',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
});

// Update student (admin can update any, counsellors only their assigned)
router.put('/:id', authenticate, [
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = parseInt(req.params.id);
    const student = await Student.findByPk(studentId, {
      include: [{
        association: 'counsellors',
        attributes: ['id']
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      const hasAccess = student.counsellors.some(c => c.id === req.user.id);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update student data
    await student.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      parentName: req.body.parentName,
      contactInfo: req.body.contactInfo,
      email: req.body.email,
      phone: req.body.phone,
      leadStatus: req.body.leadStatus,
      serviceType: req.body.serviceType,
      price: req.body.price,
      feePerYear: req.body.feePerYear,
      school: req.body.school,
      notes: req.body.notes
    });

    // Update counsellor assignments (admin only)
    if (req.user.role === 'admin' && req.body.counsellorIds) {
      await student.setCounsellors(req.body.counsellorIds);
    }

    const updatedStudent = await Student.findByPk(studentId, {
      include: [{
        association: 'counsellors',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

// Assign counsellors to student (admin only)
router.post('/:id/assign-counsellors', authenticate, isAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { counsellorIds } = req.body;

    if (!Array.isArray(counsellorIds)) {
      return res.status(400).json({ message: 'counsellorIds must be an array' });
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.setCounsellors(counsellorIds);

    const updatedStudent = await Student.findByPk(studentId, {
      include: [{
        association: 'counsellors',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning counsellors', error: error.message });
  }
});

module.exports = router;

