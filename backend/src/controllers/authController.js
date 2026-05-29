const jwt = require('jsonwebtoken');
const config = require('../config');
const authStore = require('../services/authStore');

const signUser = (user) => jwt.sign(
  { userId: user.id, email: user.email, role: user.role === 'admin' ? 'admin' : 'analyst' },
  config.jwtSecret,
  { expiresIn: '8h' }
);

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.userId;
    const { password } = req.body;
    const user = await authStore.findByEmail(email);

    if (!user || !authStore.verifyPassword(password || '', user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({ success: true, token: signUser(user), user: authStore.publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authStore.createUser({ name, email, password });
    res.status(201).json({ success: true, token: signUser(user), user: authStore.publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.email?.split('@')[0] || 'SOC Analyst',
      role: req.user.role === 'admin' ? 'Tier 3 Analyst' : 'SOC Analyst',
    },
  });
};
