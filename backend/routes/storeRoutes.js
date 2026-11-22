const router = require('express').Router();
const store = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorize('USER'), store.getStores);

router.get(
  '/owner/dashboard',
  authenticate,
  authorize('OWNER'),
  store.ownerDashboard,
);

module.exports = router;
