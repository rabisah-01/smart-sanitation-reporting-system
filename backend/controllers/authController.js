const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const ADMIN_DOMAIN = 'sanitation.gov.np';
const CITIZEN_DOMAIN = 'citizen.com';

const generateToken = (user) =>
  jwt.sign(
    { user_id: user.user_id || user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Determine role from email domain
const getRoleFromEmail = (email) => {
  const domain = email.split('@')[1];
  if (domain === ADMIN_DOMAIN) return 'admin';
  if (domain === CITIZEN_DOMAIN) return 'citizen';
  return null; // not allowed
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  // Validate email domain
  const role = getRoleFromEmail(email);
  if (!role) {
    return res.status(400).json({
      message: `Invalid email domain. Use @${CITIZEN_DOMAIN} for citizens or @${ADMIN_DOMAIN} for admins.`,
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      department: role === 'admin' ? 'Kathmandu Metropolitan City - Sanitation' : undefined,
    });

    const safe = user.toJSON();
    res.status(201).json({ user: safe, token: generateToken(safe) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  // Validate domain even on login
  const role = getRoleFromEmail(email);
  if (!role) {
    return res.status(400).json({
      message: `Invalid email domain. Use @${CITIZEN_DOMAIN} for citizens or @${ADMIN_DOMAIN} for admins.`,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const safe = user.toJSON();
    const admin_id = user.role === 'admin' ? safe.user_id : null;

    res.json({ user: { ...safe, admin_id }, token: generateToken(safe) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe };
