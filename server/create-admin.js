/**
 * Script to create an admin user
 * Run with: node create-admin.js
 */

require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    await sequelize.sync();

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User with this email already exists!');
      process.exit(1);
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
    console.log(`Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`Role: ${admin.role}`);
    console.log('\nYou can now log in with these credentials.');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    rl.close();
    await sequelize.close();
    process.exit(0);
  }
}

createAdmin();

