const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Public feed (wall)
router.get('/wall', (req, res) => {
  db.all(
    `SELECT entries.id, entries.content, entries.created_at, users.username 
     FROM entries JOIN users ON entries.user_id = users.id
     ORDER BY entries.created_at DESC LIMIT 50`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    });
});

// User's entries
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT id, content, created_at FROM entries WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    });
});

// Create
router.post('/', authenticateToken, (req, res) => {
  const { content } = req.body;
  db.run('INSERT INTO entries (content, user_id) VALUES (?, ?)', [content, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, id: this.lastID });
  });
});

// Update
router.put('/:id', authenticateToken, (req, res) => {
  const { content } = req.body;
  db.run('UPDATE entries SET content = ? WHERE id = ? AND user_id = ?', [content, req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

// Delete
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

module.exports = router;