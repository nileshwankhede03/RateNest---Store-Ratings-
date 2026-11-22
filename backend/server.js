require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Store Rating API is running' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log('MySQL Connected Successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
