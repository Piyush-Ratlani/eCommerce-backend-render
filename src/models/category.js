const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  displayImage: {
    url: {
      type: String,
      default:
        'https://res.cloudinary.com/piyush27/image/upload/v1632215188/story/Group_113_rufkkn.png',
    },
  },
});

mongoose.model('Category', categorySchema);
