/**
 * Script to create an admin user directly
 * Usage: node create-admin-direct.js email password firstName lastName
 */

require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Get from command line args or use defaults
    const email = process.argv[2] || 'admin@ivycrm.com';
    const password = process.argv[3] || 'admin123';
    const firstName = process.argv[4] || 'Admin';
    const lastName = process.argv[5] || 'User';

    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    await sequelize.sync();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User with this email already exists!');
      console.log(`Email: ${existingUser.email}`);
      console.log(`Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`Role: ${existingUser.role}`);
      await sequelize.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`Role: ${admin.role}`);
    console.log('\nYou can now log in with these credentials at http://localhost:3000');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createAdmin();

