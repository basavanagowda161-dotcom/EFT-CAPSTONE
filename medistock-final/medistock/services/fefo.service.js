const db = require('../config/db');
const { today } = require('./helpers');

exports.takeStock = function (medicineId, qty) {
  const batches = db.prepare(
    'SELECT * FROM batches WHERE medicine_id = ? AND qty > 0 AND expiry_date >= ? ORDER BY expiry_date'
  ).all(medicineId, today());

  let available = 0;
  for (const b of batches) {
    available = available + b.qty;
  }
  if (available < qty) {
    throw new Error('Not enough unexpired stock.');
  }

  let left = qty;
  for (const b of batches) {
    if (left === 0) break;
    const take = Math.min(b.qty, left);
    db.prepare('UPDATE batches SET qty = qty - ? WHERE id = ?').run(take, b.id);
    left = left - take;
  }
};