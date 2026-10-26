const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function makeToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '12h' });
}

// Anyone can register, but only as a patient
exports.register = function (req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    throw new Error('Name, email and password are required.');
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    throw new Error('This email is already registered.');
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hash, 'patient', phone || '');
  const user = { id: Number(result.lastInsertRowid), name: name, role: 'patient' };
  res.json({ token: makeToken(user), user: user });
};

exports.login = function (req, res) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.body.email || '');
  if (!user || !bcrypt.compareSync(req.body.password || '', user.password)) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }
  const info = { id: user.id, name: user.name, role: user.role };
  res.json({ token: makeToken(info), user: info });
};

// List of patients (used on the staff page)
exports.patients = function (req, res) {
  res.json(db.prepare("SELECT id, name, email FROM users WHERE role = 'patient' ORDER BY name").all());
};
// Pharmacist or admin adds a patient by email
exports.addPatient = function (req, res) {
  const { name, email, phone, password } = req.body;
  if (!name || !email) {
    throw new Error('Name and email are required.');
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    throw new Error('This email is already registered. Pick the patient from the list instead.');
  }

  // If no password is typed, make a random one
  const finalPassword = password || crypto.randomBytes(4).toString('hex');
  const hash = bcrypt.hashSync(finalPassword, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hash, 'patient', phone || '');

  res.json({
    id: Number(result.lastInsertRowid),
    message: 'Patient added. Login email: ' + email + ' | Password: ' + finalPassword + ' (tell the patient)'
  });
};