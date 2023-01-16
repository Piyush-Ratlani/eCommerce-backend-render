const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const shortid = require('shortid');

module.exports.listProduct_post = (req, res) => {
  const { name, description, price, category, displayImage, seller } = req.body;
  const productId = shortid.generate();
  console.log(displayImage);
  if (
    !name ||
    !description ||
    !price ||
    !category ||
    displayImage.length == 0 ||
    !seller
  ) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'All fields are required.',
      },
    });
  } else {
    const product = new Product({
      name,
      description,
      originalPrice: price,
      newPrice: price,
      category,
      seller,
      displayImage,
      productId,
      sellerType: req.params.accountType,
    });
    product
      .save()
      .then(savedProd => {
        Product.findById(savedProd._id)
          .populate('category', '_id name')
          .populate('seller', '_id displayName email displayImage accountType')
          .then(result => {
            return res.json({
              status: 'success',
              data: {
                product: result,
              },
              message: 'Product added successfully.',
            });
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(420).json({
          status: 'error',
          error: {
            code: 420,
            message: 'Invalid request.',
          },
        });
      });
  }
};

module.exports.allProducts_get = (req, res) => {
  Product.find()
    .sort('-createdAt')
    .populate('category', '_id name')
    .populate('seller', '_id displayName email displayImage accountType')
    .then(products => {
      return res.json({
        status: 'success',
        data: { products },
      });
    })
    .catch(err => console.log(err));
};

module.exports.particularProduct_get = (req, res) => {
  const { _id } = req.params;
  Product.findById(_id)
    .populate('category', '_id name')
    .populate('seller', '_id displayName email displayImage accountType')
    .then(product => {
      return res.json({
        status: 'success',
        data: {
          product,
        },
      });
    });
};

module.exports.deleteProduct_delete = (req, res) => {
  const { accountType, prodId } = req.params;
  const { seller, sellerType, productId } = req.body;
  const { _id: loggedInId } = req[accountType === 'admin' ? 'admin' : 'user'];

  if (
    accountType === 'admin' ||
    (accountType === 'client' && seller._id == loggedInId.toString())
  ) {
    Product.findByIdAndDelete(prodId, (error, deletedProduct) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          status: 'error',
          error: {
            code: 500,
            message: 'Internal server error.',
          },
        });
      }
      if (!deletedProduct) {
        return res.status(404).json({
          status: 'error',
          error: {
            code: 404,
            message: 'Item not found.',
          },
        });
      }
      return res.json({
        status: 'success',
        data: {
          deletedProduct,
          message: 'Item deleted successfully.',
        },
      });
    });
  } else {
    return res.status(403).json({
      status: 'error',
      error: {
        code: 403,
        message: 'Bad request.',
      },
    });
  }
};

module.exports.adminDeleteProduct_delete = (req, res) => {
  const { productId } = req.params;

  Product.deleteMany({ productId })
    .then(result => {
      if (result.deletedCount !== 0) {
        return res.json({
          status: 'success',
          data: {
            deletedCount: result.deletedCount,
            message: 'Product deleted successfully.',
          },
        });
      } else {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Product does not exist.',
          },
        });
      }
    })
    .catch(err => console.log(err));
};

module.exports.categoryProduct_get = (req, res) => {
  const { categoryId } = req.params;

  Product.find({ category: categoryId })
    .sort('-createdAt')
    .populate('category', '_id name')
    .populate('seller', '_id displayName email displayImage accountType')
    .then(products => {
      return res.json({
        status: 'success',
        data: { products },
      });
    })
    .catch(err => console.log(err));
};

module.exports.searchProduct_get = (req, res) => {
  const { name } = req.query;
  // console.log(name);

  Product.find({ name: { $regex: name, $options: 'i' } })
    .sort('-createdAt')
    .populate('category', '_id name')
    .populate('seller', '_id displayName email displayImage accountType')
    .then(products => {
      return res.json({
        status: 'success',
        data: { products },
      });
    })
    .catch(err => console.log(err));
};

module.exports.clientEditAndAddProduct_post = (req, res) => {
  const { prodId } = req.params;
  const { newPrice } = req.body;

  if (!newPrice) {
    return res.status(403).json({
      status: 'error',
      error: {
        code: 403,
        message: 'Bad request.',
      },
    });
  }
  Product.findById(prodId).then(product => {
    const originalPrice = product.newPrice;
    const seller = req.user._id.toString();
    const { name, description, category, displayImage, productId, sellerType } =
      product;

    if (sellerType == 'admin') {
      if (originalPrice == newPrice) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Please update price.',
          },
        });
      }

      const newProduct = new Product({
        name,
        description,
        category,
        displayImage,
        seller,
        originalPrice,
        productId,
        newPrice,
        sellerType: 'client',
      });
      newProduct
        .save()
        .then(savedProd => {
          Product.findById(savedProd._id)
            .populate('category', '_id name')
            .populate(
              'seller',
              '_id displayName email displayImage accountType'
            )
            .then(result => {
              return res.json({
                status: 'success',
                data: {
                  product: result,
                },
                message: 'Product added successfully.',
              });
            });
        })
        .catch(err => console.log(err));
    } else {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Invalid request.',
        },
      });
    }
  });
};

module.exports.clientEditAndUpdateProduct_post = async (req, res) => {
  const { newPrice, seller } = req.body;
  const { _id } = req.user;
  const { prodId } = req.params;

  if (seller == _id) {
    try {
      const getProduct = await Product.findById(prodId).populate(
        'seller',
        '_id'
      );
      if (getProduct.seller._id == seller) {
        Product.findByIdAndUpdate(prodId, { newPrice }, { new: true })
          .populate('category', '_id name')
          .populate('seller', '_id displayName email displayImage accountType')
          .then(updatedProduct => {
            return res.json({
              status: 'success',
              data: {
                product: updatedProduct,
                message: 'Product edit success.',
              },
            });
          })
          .catch(err => {
            console.log(err);
            return res.status(400).json({
              status: 'error',
              error: {
                code: 400,
                message: 'Bad request.',
              },
            });
          });
      } else {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Invalid request.',
          },
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Invalid request.',
        },
      });
    }
  } else {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'Invalid request.',
      },
    });
  }
};

module.exports.adminEditAndUpdateProduct_post = (req, res) => {
  const { prodId } = req.params;
  const { name, description, price, category, displayImage, availability } =
    req.body;
  const updates = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (category) updates.category = category;
  if (availability) updates.availability = availability;
  if (price) {
    updates.originalPrice = price;
    updates.newPrice = price;
  }
  if (displayImage?.length !== 0) updates.displayImage = displayImage;
  if (Object.keys(updates).length == 0) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'No updates made.',
      },
    });
  } else {
    Product.findByIdAndUpdate(prodId, updates, { new: true })
      .populate('category', '_id name')
      .populate('seller', '_id displayName email displayImage accountType')
      .then(updatedAdminProd => {
        const { name, description, newPrice, category, displayImage } =
          updatedAdminProd;
        const clientUpdates = {
          name,
          description,
          originalPrice: newPrice,
          category,
          displayImage,
        };
        Product.updateMany(
          { productId: updatedAdminProd.productId },
          clientUpdates,
          { runValidators: true }
        )
          .then(updatedClientProd => {
            return res.json({
              status: 'success',
              data: {
                adminProduct: updatedAdminProd,
                clientProducts: updatedClientProd,
              },
              message: 'Update success.',
            });
          })
          .catch(err => {
            console.log(err);
            return res.status(500).json({
              status: 'error',
              error: {
                code: 500,
                message: "Clients' product update failed.",
              },
            });
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Bad request.',
          },
        });
      });
  }
};

module.exports.productsPlacedForResell_get = (req, res) => {
  const { _id } = req.user;

  Product.find({ seller: _id })
    .sort('-createdAt')
    .populate('category', '_id name')
    .populate('seller', '_id displayName email displayImage accountType')
    .then(products => {
      return res.json({
        status: 'success',
        data: { products },
      });
    })
    .catch(err => console.log(err));
};

module.exports.adminProductsListed_get = (req, res) => {
  Product.find({ sellerType: 'admin' })
    .sort('-createdAt')
    .populate('category', '_id name')
    .then(products => {
      return res.json({
        status: 'success',
        data: { products },
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: {
          code: 500,
          message: 'Internal server error.',
        },
      });
    });
};
