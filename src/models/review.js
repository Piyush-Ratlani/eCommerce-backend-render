const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
