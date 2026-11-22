const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/signup-test', (req, res) => {
  res.json({ message: 'Public signup route working!' });
});

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.put('/password', authenticate, auth.updatePassword);

module.exports = router;
