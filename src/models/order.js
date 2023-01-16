const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    // seller: {
    //   type: ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    cart: [
      {
        product: {
          type: ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      default: 'Placed',
      validate: {
        validator: function (value) {
          return (
            ['Placed', 'Shipped', 'Delivered', 'Cancelled By Admin'].indexOf(
              value
            ) !== -1
          );
        },
        message: `{VALUE} is not a valid status. Status should be one of "Placed", "Shipped" or "Delivered"`,
      },
    },
    paymentMode: {
      type: String,
      enum: ['COD', 'Online'],
    },
    paymentStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Completed'],
      required: true,
    },
  },
  { timestamps: true }
);

// orderSchema.path('seller').set(val => {
//   if (val instanceof User) return val;
//   else if (val instanceof Admin) return val;
// });

mongoose.model('Order', orderSchema);
