const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { SECRET } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (user) return res.status(400).json({ error: 'Username exists' });
    const hash = bcrypt.hashSync(password, 8);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      const token = jwt.sign({ id: this.lastID, username, is_admin: 0 }, SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, username });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, username: user.username, is_admin: user.is_admin });
  });
});

module.exports = router;