const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  }
});

// Relationships
Task.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
Task.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });

module.exports = Task;

