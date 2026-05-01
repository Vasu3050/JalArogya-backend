const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jal_arogya';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists. Updating password to "adminpassword"...');
      existingAdmin.password = 'adminpassword';
      await existingAdmin.save();
      console.log('Admin password updated successfully');
    } else {
      const admin = new Admin({
        username: 'admin',
        password: 'adminpassword'
      });
      await admin.save();
      console.log('Admin created successfully: admin / adminpassword');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
