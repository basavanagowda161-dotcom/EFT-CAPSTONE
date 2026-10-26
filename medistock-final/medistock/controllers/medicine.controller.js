const db = require('../config/db');
const { today } = require('../services/helpers');

// All medicines with their stock (expired batches are not counted)
function getMedicines() {
  return db.prepare(
    'SELECT m.id, m.name, m.price, m.reorder_level, ' +
    'COALESCE(SUM(CASE WHEN b.expiry_date >= ? THEN b.qty END), 0) AS stock ' +
    'FROM medicines m LEFT JOIN batches b ON b.medicine_id = m.id ' +
    'GROUP BY m.id ORDER BY m.name'
  ).all(today());
}

exports.list = function (req, res) {
  res.json(getMedicines());
};

exports.addMedicine = function (req, res) {
  const { name, price, reorder_level } = req.body;
  if (!name || !price) throw new Error('Name and price are required.');
  db.prepare('INSERT INTO medicines (name, price, reorder_level) VALUES (?, ?, ?)')
    .run(name, Number(price), Number(reorder_level) || 20);
  res.json({ message: 'Medicine added.' });
};

exports.addBatch = function (req, res) {
  const { medicine_id, batch_no, expiry_date, qty } = req.body;
  if (!medicine_id || !batch_no || !expiry_date || !qty) throw new Error('Fill in every field.');
  db.prepare('INSERT INTO batches (medicine_id, batch_no, expiry_date, qty) VALUES (?, ?, ?, ?)')
    .run(Number(medicine_id), batch_no, expiry_date, Number(qty));
  res.json({ message: 'Batch added.' });
};

// Low stock, expiring within 90 days, and already expired
exports.alerts = function (req, res) {
  const t = today();
  const lowStock = getMedicines().filter(function (m) {
    return m.stock <= m.reorder_level;
  });
  const expiring = db.prepare(
    "SELECT m.name, b.batch_no, b.expiry_date, b.qty FROM batches b JOIN medicines m ON m.id = b.medicine_id " +
    "WHERE b.qty > 0 AND b.expiry_date >= ? AND b.expiry_date <= date(?, '+90 days') ORDER BY b.expiry_date"
  ).all(t, t);
  const expired = db.prepare(
    'SELECT m.name, b.batch_no, b.expiry_date, b.qty FROM batches b JOIN medicines m ON m.id = b.medicine_id ' +
    'WHERE b.qty > 0 AND b.expiry_date < ?'
  ).all(t);
  res.json({ lowStock: lowStock, expiring: expiring, expired: expired });
};