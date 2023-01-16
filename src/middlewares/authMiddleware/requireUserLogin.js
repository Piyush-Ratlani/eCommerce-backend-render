require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const JWT_SECRET_user = process.env.JWT_SECRET_user;

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
  jwt.verify(token, JWT_SECRET_user, (err, payload) => {
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
    User.findById(_id).then(userdata => {
      const { _id, displayName, displayImage, email } = userdata;
      req.user = {
        _id,
        displayName,
        displayImage,
        email,
      };
      next();
    });
  });
};
