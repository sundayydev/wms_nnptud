var express = require('express');
var router = express.Router();

// POST /api/v1/auth/login
router.post('/login', function(req, res, next) {
  res.json({ message: 'Auth login route' });
});

// POST /api/v1/auth/register
router.post('/register', function(req, res, next) {
  res.json({ message: 'Auth register route' });
});

module.exports = router;
