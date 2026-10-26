const bcrypt = require('bcryptjs');
const db = require('../config/db');

// helper: a date n days from today, as YYYY-MM-DD
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

// Extra tablets. They are added once (matched by name), even to an existing database.
const EXTRA = [
  ['Ibuprofen 400mg', 5, 40, 'IBU-101', 400, 150],
  ['Azithromycin 500mg', 18, 20, 'AZI-077', 250, 60],
  ['Pantoprazole 40mg', 6, 30, 'PAN-330', 600, 120],
  ['Omeprazole 20mg', 4.5, 30, 'OME-210', 420, 100],
  ['Atorvastatin 10mg', 9, 25, 'ATO-512', 700, 90],
  ['Amlodipine 5mg', 3.5, 30, 'AML-145', 520, 110],
  ['Losartan 50mg', 7, 25, 'LOS-208', 380, 80],
  ['Dolo 650mg', 3, 60, 'DOL-650', 450, 300],
  ['Vitamin C 500mg', 2, 40, 'VTC-500', 600, 200],
  ['ORS Sachet', 12, 25, 'ORS-009', 365, 70],
  ['Cough Syrup 100ml', 55, 10, 'CSY-100', 300, 40],
  ['Diclofenac Gel 30g', 85, 8, 'DCF-030', 400, 25]
];

function addExtraMedicines() {
  const find = db.prepare('SELECT id FROM medicines WHERE name = ?');
  const addMed = db.prepare('INSERT INTO medicines (name, price, reorder_level) VALUES (?, ?, ?)');
  const addBatch = db.prepare('INSERT INTO batches (medicine_id, batch_no, expiry_date, qty) VALUES (?, ?, ?, ?)');
  for (const [name, price, level, batch, days, qty] of EXTRA) {
    if (find.get(name)) continue;
    const r = addMed.run(name, price, level);
    addBatch.run(Number(r.lastInsertRowid), batch, daysFromNow(days), qty);
  }
}

function seed() {
  if (db.prepare('SELECT COUNT(*) AS c FROM users').get().c > 0) {
    addExtraMedicines();
    return; // already has users
  }

  const password = bcrypt.hashSync('pass123', 10);
  const addUser = db.prepare('INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)');
  addUser.run('Admin', 'admin@medistock.com', password, 'admin', '');
  addUser.run('Priya Pharmacist', 'pharmacist@medistock.com', password, 'pharmacist', '');
  addUser.run('Chandan Cashier', 'cashier@medistock.com', password, 'cashier', '');
  addUser.run('Asha Patient', 'patient@medistock.com', password, 'patient', '9876543210');

  const addMed = db.prepare('INSERT INTO medicines (name, price, reorder_level) VALUES (?, ?, ?)');
  addMed.run('Paracetamol 500mg', 2.5, 50);
  addMed.run('Amoxicillin 250mg', 8, 20);
  addMed.run('Cetirizine 10mg', 3, 30);
  addMed.run('Metformin 500mg', 4, 40);

  const addBatch = db.prepare('INSERT INTO batches (medicine_id, batch_no, expiry_date, qty) VALUES (?, ?, ?, ?)');
  addBatch.run(1, 'PCM-001', daysFromNow(300), 200);
  addBatch.run(1, 'PCM-000', daysFromNow(-10), 20); // already expired
  addBatch.run(2, 'AMX-014', daysFromNow(45), 8);   // low stock and expiring soon
  addBatch.run(3, 'CTZ-220', daysFromNow(500), 120);
  addBatch.run(4, 'MET-310', daysFromNow(80), 60);

  // A demo schedule so the patient dashboard is not empty
  db.prepare(
    'INSERT INTO schedules (patient_id, medicine_id, dose, times, food, notes, start_date, days, doctor, hospital) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(4, 1, '1 tablet', '08:00,14:00,21:00', 'after food', 'Finish the full course', daysFromNow(0), 5, 'Dr. Rao', 'City Hospital');

  addExtraMedicines();
  console.log('Demo data added. Password for every demo user is pass123');
}

module.exports = seed;

// "npm run seed" runs this file directly
if (require.main === module) seed();
