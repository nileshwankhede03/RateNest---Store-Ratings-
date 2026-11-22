const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateUser = (name, email, address, password) => {
  if (!name || name.length < 20 || name.length > 60)
    return 'Name must be 20-60 characters';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';

  if (address && address.length > 400) return 'Address maximum 400 characters';

  if (
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return 'Password must be 8-16 characters with uppercase and special character';
  }

  return null;
};

exports.signup = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Required fields are missing',
      });
    }

    const error = validateUser(name, email, address || '', password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [
      email,
    ]);

    if (existing.length) {
      return res.status(409).json({
        message: 'Email already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, 'USER')`,
      [name, email, hashedPassword, address || ''],
    );

    res.status(201).json({
      message: 'Registration successful',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (!users.length) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (
      !newPassword ||
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        message: 'Invalid new password format',
      });
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [
      req.user.id,
    ]);

    if (
      !users.length ||
      !(await bcrypt.compare(oldPassword, users[0].password))
    ) {
      return res.status(400).json({
        message: 'Old password is incorrect',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [
      hashed,
      req.user.id,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
