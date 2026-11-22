const router = require('express').Router();
const admin = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', admin.dashboard);
router.post('/users', admin.createUser);
router.post('/stores', admin.createStore);
router.get('/users', admin.getUsers);
router.get('/stores', admin.getStores);
router.get('/users/:id', admin.getUserDetails);

module.exports = router;
