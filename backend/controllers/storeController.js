const db = require('../config/db');

exports.getStores = async (req, res) => {
  try {
    const { search = '', sort = 'name', order = 'ASC' } = req.query;

    const allowedSort = ['name', 'address'];
    const sortBy = allowedSort.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [stores] = await db.query(
      `SELECT s.id, s.name, s.address,
             ROUND(AVG(r.rating), 2) AS overallRating,
             MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS myRating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.name LIKE ? OR s.address LIKE ?
             GROUP BY s.id
             ORDER BY ${sortBy} ${sortOrder}`,
      [req.user.id, `%${search}%`, `%${search}%`],
    );

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.ownerDashboard = async (req, res) => {
  try {
    const [stores] = await db.query(
      `SELECT s.id, s.name,
             ROUND(AVG(r.rating), 2) AS averageRating,
             COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id`,
      [req.user.id],
    );

    const [ratings] = await db.query(
      `SELECT u.name, u.email, r.rating, r.created_at,
             s.name AS storeName
             FROM ratings r
             JOIN users u ON u.id = r.user_id
             JOIN stores s ON s.id = r.store_id
             WHERE s.owner_id = ?
             ORDER BY r.created_at DESC`,
      [req.user.id],
    );

    res.json({ stores, ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
