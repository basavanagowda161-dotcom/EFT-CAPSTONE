CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT UNIQUE, password TEXT,
  role TEXT,            -- admin, pharmacist, cashier or patient
  phone TEXT
);

CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, price REAL, reorder_level INTEGER DEFAULT 20
);

CREATE TABLE IF NOT EXISTS batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER, batch_no TEXT, expiry_date TEXT, qty INTEGER
);

-- Online orders placed from the home page cart
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER, name TEXT, phone TEXT, address TEXT, city TEXT, pincode TEXT,
  total REAL, status TEXT DEFAULT 'Placed',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER, medicine_id INTEGER, qty INTEGER, total REAL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  order_id INTEGER
);

-- The tablet timings and instructions shown on the patient dashboard
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER, medicine_id INTEGER,
  dose TEXT,            -- for example: 1 tablet
  times TEXT,           -- for example: 08:00,14:00,21:00
  food TEXT,            -- before food, after food, with food, any time
  notes TEXT,           -- extra instructions
  start_date TEXT, days INTEGER,
  doctor TEXT, hospital TEXT
);
