require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

require('./Database/seed')(); // creates demo data only if the database is empty

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves the html, css and js files

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/medicines', require('./routes/medicine.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// If any code throws an error, send it back as JSON
app.use(function (err, req, res, next) {
  res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Open http://localhost:' + PORT);
});
