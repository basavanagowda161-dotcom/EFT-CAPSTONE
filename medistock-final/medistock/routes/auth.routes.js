const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/patients', auth, role('admin', 'pharmacist', 'cashier'), c.patients);
router.post('/patients', auth, role('admin', 'pharmacist'), c.addPatient);

module.exports = router;
