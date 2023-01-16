const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    seller: {
      type: ObjectId,
      ref: function () {
        return this.sellerType === 'admin' ? 'Admin' : 'User';
      },
      required: true,
    },
    displayImage: [
      {
        url: {
          type: String,
          default:
            'https://res.cloudinary.com/piyush27/image/upload/v1632215188/story/Group_113_rufkkn.png',
        },
      },
    ],

    sellerType: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      enum: ['Available', 'Out Of Stock'],
      default: 'Available',
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.model('Product', productSchema);
