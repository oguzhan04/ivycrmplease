require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    const email = 'admin@ivycrm.com';
    const password = 'admin123';
    
    console.log(`Testing login for: ${email}`);
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found!');
      // Try with normalized email
      const normalized = email.toLowerCase().trim();
      console.log(`Trying normalized: ${normalized}`);
      const user2 = await User.findOne({ where: { email: normalized } });
      if (user2) {
        console.log('✅ Found with normalized email');
        const isValid = await user2.checkPassword(password);
        console.log(`Password check: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      } else {
        console.log('❌ Still not found');
      }
    } else {
      console.log('✅ User found!');
      console.log(`Email: ${user.email}`);
      console.log(`Active: ${user.isActive}`);
      const isValid = await user.checkPassword(password);
      console.log(`Password check: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      
      if (!isValid) {
        console.log('\n⚠️ Password mismatch. Creating new admin with known password...');
        // Delete old and create new
        await user.destroy();
        const newAdmin = await User.create({
          email: 'admin@ivycrm.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        });
        console.log('✅ New admin created!');
        const testPass = await newAdmin.checkPassword('admin123');
        console.log(`Password verification: ${testPass ? '✅ Works' : '❌ Still broken'}`);
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

