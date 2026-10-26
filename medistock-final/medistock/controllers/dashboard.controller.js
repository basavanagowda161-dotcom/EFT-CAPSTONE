const db = require('../config/db');

// Everything the patient dashboard needs
exports.me = function (req, res) {
  const user = db.prepare('SELECT name, email, phone FROM users WHERE id = ?').get(req.user.id);
  const schedules = db.prepare(
    'SELECT s.*, m.name AS medicine FROM schedules s JOIN medicines m ON m.id = s.medicine_id ' +
    'WHERE s.patient_id = ? ORDER BY s.id DESC'
  ).all(req.user.id);
  res.json({ user: user, schedules: schedules });
};