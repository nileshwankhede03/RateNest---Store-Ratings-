const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.dashboard = async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [[stores]] = await db.query('SELECT COUNT(*) AS total FROM stores');
    const [[ratings]] = await db.query('SELECT COUNT(*) AS total FROM ratings');

    res.json({
      totalUsers: users.total,
      totalStores: stores.total,
      totalRatings: ratings.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (
      !name ||
      name.length < 20 ||
      name.length > 60 ||
      !email ||
      !password ||
      !['ADMIN', 'USER', 'OWNER'].includes(role)
    ) {
      return res.status(400).json({
        message: 'Invalid user details',
      });
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password) ||
      (address && address.length > 400) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        message: 'Invalid email, password or address',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
            (name, email, address, password, role)
            VALUES (?, ?, ?, ?, ?)`,
      [name, email, address || '', hashed, role],
    );

    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    res
      .status(error.code === 'ER_DUP_ENTRY' ? 409 : 500)
      .json({ message: error.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !address || address.length > 400) {
      return res.status(400).json({
        message: 'Invalid store details',
      });
    }

    if (owner_id) {
      const [owners] = await db.query(
        "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
        [owner_id],
      );

      if (!owners.length) {
        return res.status(400).json({
          message: 'Invalid store owner',
        });
      }
    }

    await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
      [name, email || null, address, owner_id || null],
    );

    res.status(201).json({
      message: 'Store created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sort = 'name',
      order = 'ASC',
    } = req.query;

    const allowedSort = ['name', 'email', 'address', 'role'];
    const sortBy = allowedSort.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
            SELECT id, name, email, address, role
            FROM users WHERE 1=1
        `;
    const values = [];

    if (name) {
      sql += ' AND name LIKE ?';
      values.push(`%${name}%`);
    }
    if (email) {
      sql += ' AND email LIKE ?';
      values.push(`%${email}%`);
    }
    if (address) {
      sql += ' AND address LIKE ?';
      values.push(`%${address}%`);
    }
    if (role) {
      sql += ' AND role = ?';
      values.push(role);
    }

    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [users] = await db.query(sql, values);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sort = 'name', order = 'ASC' } = req.query;

    const allowedSort = ['name', 'email', 'address'];
    const sortBy = allowedSort.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
            SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 2) AS rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1
        `;
    const values = [];

    if (name) {
      sql += ' AND s.name LIKE ?';
      values.push(`%${name}%`);
    }
    if (email) {
      sql += ' AND s.email LIKE ?';
      values.push(`%${email}%`);
    }
    if (address) {
      sql += ' AND s.address LIKE ?';
      values.push(`%${address}%`);
    }

    sql += ` GROUP BY s.id ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await db.query(sql, values);
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
             ROUND(AVG(r.rating), 2) AS rating
             FROM users u
             LEFT JOIN stores s ON s.owner_id = u.id
             LEFT JOIN ratings r ON r.store_id = s.id
             WHERE u.id = ?
             GROUP BY u.id`,
      [req.params.id],
    );

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
