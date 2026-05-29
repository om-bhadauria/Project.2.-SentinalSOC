const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const usersFile = path.join(dataDir, 'users.json');

const demoUser = {
  id: 'demo-admin',
  name: 'Admin SOC',
  email: process.env.DEMO_ADMIN_EMAIL || 'admin@sentinel.soc',
  role: 'admin',
  passwordHash: hashPassword(process.env.DEMO_ADMIN_PASS || 'SentinelDemo123!'),
};

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, expected] = passwordHash.split(':');
  if (!salt || !expected) return false;
  const actual = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

async function readUsers() {
  try {
    const raw = await fs.readFile(usersFile, 'utf8');
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

async function allUsers() {
  const storedUsers = await readUsers();
  const hasDemoUser = storedUsers.some(user => user.email === demoUser.email);
  return hasDemoUser ? storedUsers : [demoUser, ...storedUsers];
}

async function findByEmail(email) {
  const users = await allUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

async function createUser({ name, email, password }) {
  const users = await allUsers();
  if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    const error = new Error('Account already exists');
    error.status = 409;
    throw error;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    role: 'analyst',
    passwordHash: hashPassword(password),
  };

  const persistedUsers = users.filter(item => item.id !== demoUser.id);
  await writeUsers([...persistedUsers, user]);
  return user;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'Tier 3 Analyst' : 'SOC Analyst',
  };
}

module.exports = {
  createUser,
  findByEmail,
  publicUser,
  verifyPassword,
};
