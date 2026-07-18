const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./connect');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

async function initDatabase() {
  try {
    await connectDB();

    const password = 'Admin@123';
    const hashed = await bcrypt.hash(password, 10);

    // Seed admin user
    let admin = await User.findOne({ email: 'admin@sanitation.gov.np' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@sanitation.gov.np',
        password: hashed,
        role: 'admin',
        department: 'Kathmandu Metropolitan City - Sanitation',
      });
    }

    // Seed citizen user
    let citizen = await User.findOne({ email: 'rabi@citizen.com' });
    let createdCitizen = false;
    if (!citizen) {
      citizen = await User.create({
        name: 'Rabi Sah',
        email: 'rabi@citizen.com',
        password: hashed,
        role: 'citizen',
      });
      createdCitizen = true;
    }

    // Seed sample complaints only the first time the citizen is created
    if (createdCitizen) {
      await Complaint.insertMany([
        {
          user_id: citizen._id,
          description: 'Large pile of garbage has been uncollected for 3 days near the market.',
          location: 'New Road, Kathmandu',
          category: 'garbage',
          status: 'pending',
          priority: 'high',
        },
        {
          user_id: citizen._id,
          description: 'Clogged drain causing water overflow on the main road during rain.',
          location: 'Thamel, Kathmandu',
          category: 'drainage',
          status: 'assigned',
          priority: 'high',
        },
        {
          user_id: citizen._id,
          description: 'Public park near the school is very dirty, waste bins overflowing.',
          location: 'Baneshwor, Kathmandu',
          category: 'public_space',
          status: 'in_progress',
          priority: 'medium',
        },
        {
          user_id: citizen._id,
          description: 'Waste dumped on roadside near residential area for over a week.',
          location: 'Patan, Lalitpur',
          category: 'garbage',
          status: 'resolved',
          priority: 'low',
        },
      ]);
    }

    console.log('✅ Database initialized successfully with seed data');
    console.log('');
    console.log('📧 Demo Login Credentials:');
    console.log('   Admin   : admin@sanitation.gov.np  / Admin@123');
    console.log('   Citizen : rabi@citizen.com         / Admin@123');
    console.log('');
    console.log('🔒 Email domain rules:');
    console.log('   Admin accounts   → must use @sanitation.gov.np');
    console.log('   Citizen accounts → must use @citizen.com');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

initDatabase();
