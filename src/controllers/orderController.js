const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');
require('../models/user');
require('../models/admin');

module.exports.placeOrder_post = (req, res) => {
  const { _id } = req.user;
  const {
    // seller,
    cart,
    price,
    shippingAddress,
    orderStatus,
    paymentMode,
    paymentStatus,
  } = req.body;

  if (
    // !seller ||
    cart.length == 0 ||
    !price ||
    !shippingAddress ||
    !paymentMode ||
    !paymentStatus
  ) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'Bad Request.',
      },
    });
  } else {
    const newOrder = new Order({
      buyer: _id,
      //   seller,
      cart,
      price,
      shippingAddress,
      orderStatus,
      paymentMode,
      paymentStatus,
    });

    newOrder
      .save()
      .then(savedOrder => {
        Order.findById(savedOrder._id)
          //   .populate('seller', '_id displayName email accountType')
          .populate('buyer', '_id displayName displayImage email accountType')
          .populate(
            'cart.product',
            '_id name description newPrice seller dispayImage sellerType category'
          )
          .then(popOrder => {
            return res.json({
              status: 'success',
              data: {
                order: popOrder,
              },
              message: 'Order placed successfully.',
            });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};

module.exports.updateOrderStatusAndPayment_post = (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, paymentMode } = req.body;
  let { paymentStatus } = req.body;

  if (!paymentMode || !orderStatus || !paymentStatus) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'Field missing',
      },
    });
  }

  if (paymentMode === 'COD' && orderStatus === 'Delivered') {
    paymentStatus = 'Completed';
  }

  Order.findByIdAndUpdate(
    orderId,
    { orderStatus, paymentStatus },
    { new: true, runValidators: true }
  )
    .populate('buyer', '_id displayName displayImage email accountType')
    .populate(
      'cart.product',
      '_id name description newPrice originalPrice seller dispayImage sellerType category'
    )
    .then(async updatedOrder => {
      let walletUpdateData = [];
      if (
        updatedOrder.orderStatus == 'Delivered'
        // && updatedOrder.paymentStatus == 'Completed'
      ) {
        const { cart } = updatedOrder;

        const walletUpdatePromises = cart.map(async item => {
          const { product, quantity } = item;

          const addedMargin =
            (product.newPrice - product.originalPrice) * quantity;

          if (product.sellerType === 'client') {
            try {
              const user = await User.findById(
                product.seller,
                'displayName email eComm_wallet'
              );
              const updatedAmount = user.eComm_wallet + addedMargin;

              const updatedUser = await User.findOneAndUpdate(
                { _id: product.seller },
                { $inc: { eComm_wallet: addedMargin } },
                { new: true }
              );
              return {
                _id: updatedUser._id,
                name: user.displayName,
                email: user.email,
                eComm_wallet: updatedUser.eComm_wallet,
              };
            } catch (error) {
              console.log(error);
            }
          }
        });

        walletUpdateData = await Promise.all(walletUpdatePromises);
      }

      // const uniqueWalletUpdates = walletUpdateData.reduce((result, current) => {
      //   const index = result.findIndex(item => {
      //     console.log(item._id, current._id);
      //     return item._id === current._id;
      //   });
      //   console.log(index);
      //   if (index === -1) {
      //     result.push(current);
      //   } else {
      //     result[index] = current;
      //   }
      //   return result;
      // }, []);
      // console.log({ uniqueWalletUpdates });

      return res.json({
        status: 'success',
        data: {
          order: updatedOrder,
          walletUpdateTraces:
            walletUpdateData.length !== 0 ? walletUpdateData : 'none',
        },
        message: 'Order status updated.',
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Bad request',
        },
      });
    });
};

module.exports.previousOrderUser_get = (req, res) => {
  const { buyerId } = req.params;

  Order.find({ buyer: buyerId })
    .populate('buyer', '_id displayName displayImage email accountType')
    .populate(
      'cart.product',
      '_id name description newPrice seller dispayImage sellerType category'
    )
    .then(list => {
      return res.json({
        status: 'success',
        data: {
          orders: list,
        },
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

module.exports.previousResellOrderUser_get = (req, res) => {
  const { userId } = req.params;

  Order.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'cart.product',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $match: {
        'products.seller': mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
        quantity: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$cart',
                as: 'item',
                cond: {
                  $eq: ['$$item.product', '$products._id'],
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        price: {
          $multiply: ['$products.newPrice', '$quantity.quantity'],
        },
        originalCP: {
          $multiply: ['$products.originalPrice', '$quantity.quantity'],
        },
      },
    },
    {
      $addFields: {
        margin: {
          $subtract: ['$price', '$originalCP'],
        },
      },
    },
    {
      $project: {
        cart: 0,
        originalCP: 0,
        matchedProduct: 0,
      },
    },
  ])
    .then(orders => {
      // orders will contain the orders with products whose seller match the given user id
      res.json({ orders });
      console.log(orders);
    })
    .catch(error => {
      console.log(error);
    });
};
