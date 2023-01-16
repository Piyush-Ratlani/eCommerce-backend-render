const express = require('express');
const productController = require('../controllers/productController');
const requireLogin = require('../middlewares/authMiddleware/index');
const requireUserLogin = require('../middlewares/authMiddleware/requireUserLogin');
const requireAdminLogin = require('../middlewares/authMiddleware/requireAdminLogin');
const router = express.Router();

router.post(
  '/:accountType/product/post',
  requireLogin,
  productController.listProduct_post
);
router.get('/product/all', productController.allProducts_get);
router.get('/product/details/:_id', productController.particularProduct_get);
router.get(
  '/product/category/:categoryId',
  productController.categoryProduct_get
);
router.delete(
  '/:accountType/product/:prodId/delete',
  requireLogin,
  productController.deleteProduct_delete
);
router.delete(
  '/admin/products/:productId/delete/all',
  requireAdminLogin,
  productController.adminDeleteProduct_delete
);
router.get('/product/search', productController.searchProduct_get);
router.post(
  '/client/product/:prodId/add',
  requireUserLogin,
  productController.clientEditAndAddProduct_post
);
router.post(
  '/client/product/:prodId/edit',
  requireUserLogin,
  productController.clientEditAndUpdateProduct_post
);
router.get(
  '/client/product/resell/all',
  requireUserLogin,
  productController.productsPlacedForResell_get
);
router.get(
  '/admin/product/all',
  requireAdminLogin,
  productController.adminProductsListed_get
);

router.post(
  '/admin/product/:prodId/edit/all',
  requireAdminLogin,
  productController.adminEditAndUpdateProduct_post
);

// test route
router.get('/:accountType/test/:param', requireLogin, (req, res) => {
  console.log(req.admin._id);
  return res.send(`route accessed ${req.params.param}`);
});

module.exports = router;
