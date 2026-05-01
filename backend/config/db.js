const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    await seedDefaults();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Auto-seed email config from .env and default system settings on first run
const seedDefaults = async () => {
  try {
    const EmailConfig    = require('../models/EmailConfig');
    const SystemSettings = require('../models/SystemSettings');

    // Seed email config from .env if not already in DB
    const configExists = await EmailConfig.findOne();
    if (!configExists && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await EmailConfig.create({
        emailUser:    process.env.EMAIL_USER,
        emailPass:    process.env.EMAIL_PASS,
        subject:      'Greeting from Our Team',
        bodyTemplate: 'Hi {{email}}, we hope you are doing well. This is a message from our platform. Welcome aboard!',
      });
      console.log('Email config seeded from .env');
    }

    // Seed system settings if not present
    const settingsExist = await SystemSettings.findOne();
    if (!settingsExist) {
      await SystemSettings.create({ requireApproval: false });
      console.log('System settings seeded');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = connectDB;
