require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });
    
    console.log('\n=== Users in Database ===');
    if (users.length === 0) {
      console.log('No users found!');
    } else {
      users.forEach(u => {
        console.log(`Email: ${u.email}`);
        console.log(`Name: ${u.firstName} ${u.lastName}`);
        console.log(`Role: ${u.role}`);
        console.log(`Active: ${u.isActive}`);
        console.log('---');
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

