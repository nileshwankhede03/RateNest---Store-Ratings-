const router = require('express').Router();
const rating = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorize('USER'), rating.submitRating);

module.exports = router;
