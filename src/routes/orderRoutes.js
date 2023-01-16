const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const requireUserLogin = require('../middlewares/authMiddleware/requireUserLogin');
const requireAdminLogin = require('../middlewares/authMiddleware/requireAdminLogin');

router.post(
  '/order/:buyerId',
  requireUserLogin,
  orderController.placeOrder_post
);
router.post(
  '/admin/order/:orderId/status/update',
  requireAdminLogin,
  orderController.updateOrderStatusAndPayment_post
);
router.get(
  '/user/:buyerId/orders',
  requireUserLogin,
  orderController.previousOrderUser_get
);
router.get(
  '/user/:userId/orders/resell',
  requireUserLogin,
  orderController.previousResellOrderUser_get
);

module.exports = router;
