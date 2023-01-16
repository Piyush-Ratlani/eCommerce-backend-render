const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
});

mongoose.model('Category', categorySchema);
