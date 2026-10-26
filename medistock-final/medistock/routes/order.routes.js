const router = require('express').Router();
const c = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role('patient'), c.create);
router.get('/mine', auth, role('patient'), c.mine);
router.get('/', auth, role('admin', 'pharmacist', 'cashier'), c.list);
router.patch('/:id/status', auth, role('admin', 'pharmacist'), c.setStatus);

module.exports = router;
