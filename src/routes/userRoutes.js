const express = require('express');
const userController = require('../controllers/userController');
const requireUserLogin = require('../middlewares/authMiddleware/requireUserLogin');
const router = express.Router();

router.post(
  '/user/:userId/address/update',
  requireUserLogin,
  userController.updateUserAddress
);

module.exports = router;
