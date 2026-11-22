const db = require('../config/db');

exports.submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    if (
      !store_id ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [
      store_id,
    ]);

    if (!stores.length) {
      return res.status(404).json({
        message: 'Store not found',
      });
    }

    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, store_id, rating],
    );

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
