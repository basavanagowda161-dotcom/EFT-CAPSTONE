const router = require('express').Router();
const c = require('../controllers/medicine.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', c.list); // public: used on the home page
router.get('/alerts', auth, role('admin', 'pharmacist'), c.alerts);
router.post('/', auth, role('admin', 'pharmacist'), c.addMedicine);
router.post('/batches', auth, role('admin', 'pharmacist'), c.addBatch);

module.exports = router;