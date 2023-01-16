require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
require('./models/user');
require('./models/admin');
require('./models/category');
require('./models/product');
require('./models/order');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const mongoString = process.env.DATABASE_URL;
const PORT = process.env.PORT || 8080;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', err => console.log(err));
database.once('connected', () => console.log('Database Connected'));

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});

app.use(authRoutes);
app.use(categoryRoutes);
app.use(productRoutes);
app.use(orderRoutes);
