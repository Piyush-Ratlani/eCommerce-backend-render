const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayImage: {
    url: {
      type: String,
      default:
        'https://res.cloudinary.com/piyush27/image/upload/v1632215188/story/Group_113_rufkkn.png',
    },
  },
  cart: [
    {
      product: {
        type: ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  previousOrder: [{ type: ObjectId, ref: 'Order' }],
  accountType: {
    type: String,
    default: 'client',
  },
  shippingAddress: [
    {
      type: String,
    },
  ],
  eComm_wallet: {
    type: Number,
    required: true,
    default: 0,
  },
});

mongoose.model('User', userSchema);
