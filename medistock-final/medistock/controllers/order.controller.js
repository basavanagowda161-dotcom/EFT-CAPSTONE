const db = require('../config/db');
const { takeStock } = require('../services/fefo.service');

// A patient places an order from the home page cart
exports.create = function (req, res) {
  const { items, name, phone, address, city, pincode } = req.body;

  if (!items || items.length === 0) throw new Error('Your cart is empty.');
  if (!name || !address || !city) throw new Error('Please fill in your name, address and city.');
  if (!/^[0-9]{10}$/.test(phone || '')) throw new Error('Phone number must be 10 digits.');
  if (!/^[0-9]{6}$/.test(pincode || '')) throw new Error('Pincode must be 6 digits.');

  let grandTotal = 0;
  let orderId = 0;

  // Either the whole order is saved, or nothing is
  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO orders (patient_id, name, phone, address, city, pincode, total) VALUES (?, ?, ?, ?, ?, ?, 0)'
    ).run(req.user.id, name, phone, address, city, pincode);
    orderId = Number(result.lastInsertRowid);

    for (const item of items) {
      const quantity = parseInt(item.qty);
      const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(Number(item.medicine_id));
      if (!med || !(quantity > 0)) {
        throw new Error('Something in your cart is not valid.');
      }

      takeStock(med.id, quantity); // takes from the batch that expires first

      const total = med.price * quantity;
      grandTotal = grandTotal + total;
      db.prepare('INSERT INTO sales (patient_id, medicine_id, qty, total, order_id) VALUES (?, ?, ?, ?, ?)')
        .run(req.user.id, med.id, quantity, total, orderId);
    }

    db.prepare('UPDATE orders SET total = ? WHERE id = ?').run(grandTotal, orderId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  res.json({
    message: 'Order #' + orderId + ' placed! Total: Rs ' + grandTotal +
      '. Pay at delivery or pickup. Your pharmacist will add your tablet timings.'
  });
};

// Adds the medicines of each order: o.lines (detailed) and o.items (short text)
function addItems(orders) {
  for (const o of orders) {
    o.lines = db.prepare(
      'SELECT m.name, s.qty, s.total FROM sales s JOIN medicines m ON m.id = s.medicine_id WHERE s.order_id = ?'
    ).all(o.id);
    o.items = o.lines.map(function (r) { return r.name + ' x' + r.qty; }).join(', ');
  }
  return orders;
}

// For staff and admin: all orders with their medicines
exports.list = function (req, res) {
  res.json(addItems(db.prepare('SELECT * FROM orders ORDER BY id DESC').all()));
};

// For a patient: only their own orders
exports.mine = function (req, res) {
  res.json(addItems(db.prepare('SELECT * FROM orders WHERE patient_id = ? ORDER BY id DESC').all(req.user.id)));
};

// Admin or pharmacist changes the status of an order
const STATUSES = ['Placed', 'Confirmed', 'Out for delivery', 'Delivered'];
exports.setStatus = function (req, res) {
  const status = req.body.status;
  if (!STATUSES.includes(status)) throw new Error('Choose a valid status.');
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  if (result.changes === 0) throw new Error('Order not found.');
  res.json({ message: 'Order #' + req.params.id + ' is now: ' + status });
};
