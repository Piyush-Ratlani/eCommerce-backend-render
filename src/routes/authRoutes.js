const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/hello', (req, res) => {
  res.send('hello world');
});
router.post('/user-signup', authController.userSignup_post);
router.post('/user-signin', authController.userSignin_post);
router.post('/admin-signup', authController.adminSignup_post);
router.post('/admin-signin', authController.adminSignin_post);

module.exports = router;
