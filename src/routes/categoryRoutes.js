const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.post('/category/post', categoryController.addCategory_post);
router.get('/category/all', categoryController.allCategory_get);

module.exports = router;
