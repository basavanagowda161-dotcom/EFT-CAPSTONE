const router = require('express').Router();
const c = require('../controllers/billing.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role('admin', 'pharmacist', 'cashier'), c.create);

module.exports = router;