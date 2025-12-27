const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const User = require('./User');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  meetingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date of the meeting or deadline'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Meeting notes, action items, assignments, etc.'
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Highlight important items (like yellow highlights in your sheet)'
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Relationships
Meeting.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Meeting.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

module.exports = Meeting;

