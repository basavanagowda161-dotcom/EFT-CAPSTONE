const db = require('../config/db');
const { today } = require('../services/helpers');
const { takeStock } = require('../services/fefo.service');

// Sell one or more tablets in one go.
// If a patient and times are given for a tablet, its schedule is saved too.
exports.create = function (req, res) {
  const { patient_id, doctor, hospital, items } = req.body;
  if (!items || items.length === 0) {
    throw new Error('Choose at least one medicine.');
  }

  const patient = patient_id ? Number(patient_id) : null;
  let grandTotal = 0;
  let schedulesSaved = 0;

  // BEGIN ... COMMIT means: either everything is saved, or nothing is.
  // (So if the second tablet is out of stock, the first one is not sold either.)
  db.exec('BEGIN');
  try {
    for (const item of items) {
      const quantity = parseInt(item.qty);
      if (!item.medicine_id || !(quantity > 0)) {
        throw new Error('Choose a medicine and a quantity for each tablet.');
      }

      const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(Number(item.medicine_id));
      if (!med) throw new Error('Medicine not found.');

      // Times must look like 08:00,14:00,21:00
      if (item.times) {
        for (const t of item.times.split(',')) {
          if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(t.trim())) {
            throw new Error('Write times like 08:00,14:00,21:00 (for ' + med.name + ').');
          }
        }
      }

      takeStock(med.id, quantity);

      const total = med.price * quantity;
      grandTotal = grandTotal + total;
      db.prepare('INSERT INTO sales (patient_id, medicine_id, qty, total) VALUES (?, ?, ?, ?)')
        .run(patient, med.id, quantity, total);

      if (patient && item.times) {
        db.prepare(
          'INSERT INTO schedules (patient_id, medicine_id, dose, times, food, notes, start_date, days, doctor, hospital) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(patient, med.id, item.dose || '1 tablet', item.times, item.food || 'any time',
          item.notes || '', today(), parseInt(item.days) || 1, doctor || '', hospital || '');
        schedulesSaved = schedulesSaved + 1;
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  let note = '';
  if (!patient) note = ' Walk-in sale, so nothing is shown on a dashboard.';
  else if (schedulesSaved > 0) note = ' ' + schedulesSaved + ' tablet schedule(s) saved for the patient.';
  else note = ' No schedule saved because Times was empty.';

  res.json({ message: 'Sold ' + items.length + ' medicine(s). Total: Rs ' + grandTotal + '.' + note });
};