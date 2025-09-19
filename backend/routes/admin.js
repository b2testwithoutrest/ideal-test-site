const express = require('express');
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// List users
router.get('/users', authenticateToken, isAdmin, (req, res) => {
  db.all('SELECT id, username, is_admin FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Delete user
router.delete('/user/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// Basic stats
router.get('/stats', authenticateToken, isAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as user_count FROM users', [], (err, row1) => {
    db.get('SELECT COUNT(*) as entry_count FROM entries', [], (err, row2) => {
      res.json({ users: row1.user_count, entries: row2.entry_count });
    });
  });
});

module.exports = router;