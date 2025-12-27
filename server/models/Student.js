const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Student Information
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Parent/Lead Information
  parentName: {
    type: DataTypes.STRING,
    comment: 'Parent or primary contact name'
  },
  contactInfo: {
    type: DataTypes.TEXT,
    comment: 'Contact number, email, or notes about contact person'
  },
  // Lead Status (from your tracking sheet)
  leadStatus: {
    type: DataTypes.ENUM('prospect', 'success', 'failed', 'tentative', 'active', 'applied', 'accepted', 'enrolled', 'inactive'),
    defaultValue: 'prospect',
    comment: 'Başarılı (success), Başarısız (failed), Tentative/Seneye (tentative)'
  },
  // Service Information
  serviceType: {
    type: DataTypes.ENUM('US', 'UK', 'US+UK', 'UK+EU', 'US+UK+EU', 'AP', 'Consultancy', 'Other'),
    comment: 'HİZMET - Type of service provided'
  },
  // Pricing Information
  price: {
    type: DataTypes.STRING,
    comment: 'FİYAT - Quoted price (e.g., "7500 USD", "6000+KDV")'
  },
  feePerYear: {
    type: DataTypes.STRING,
    comment: 'F/Y - Fee per year component'
  },
  // School Information
  school: {
    type: DataTypes.STRING,
    comment: 'Okul - Current school of the student'
  },
  // Contact Information
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  // General Notes
  notes: {
    type: DataTypes.TEXT,
    comment: 'General notes about the student/lead'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Many-to-many relationship: Students can have multiple counsellors
Student.belongsToMany(User, { 
  through: 'StudentCounsellors', 
  as: 'counsellors',
  foreignKey: 'studentId'
});
User.belongsToMany(Student, { 
  through: 'StudentCounsellors', 
  as: 'students',
  foreignKey: 'counsellorId'
});

module.exports = Student;

