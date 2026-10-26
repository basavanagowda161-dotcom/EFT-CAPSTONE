// Opens the SQLite database (built into Node 22+, no extra install needed)
// and makes sure all tables exist.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const folder = path.join(__dirname, '..', 'Database');
const db = new DatabaseSync(path.join(folder, 'medistock.db'));
db.exec(fs.readFileSync(path.join(folder, 'schema.sql'), 'utf8'));

module.exports = db;
