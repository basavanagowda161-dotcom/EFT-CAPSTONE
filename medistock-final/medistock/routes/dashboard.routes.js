const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('patient'), c.me);

module.exports = router;