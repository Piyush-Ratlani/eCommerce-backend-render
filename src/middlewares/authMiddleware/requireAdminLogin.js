require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const JWT_SECRET_admin = process.env.JWT_SECRET_admin;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: 401,
        message: 'Unauthorized access.',
      },
    });
  }

  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, JWT_SECRET_admin, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 401,
          message: 'Unauthorized access.',
        },
      });
    }
    const { _id } = payload;
    Admin.findById(_id).then(admindata => {
      req.admin = admindata;
      next();
    });
  });
};
