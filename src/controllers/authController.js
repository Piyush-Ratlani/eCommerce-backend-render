const mongoose = require('mongoose');
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET_user = process.env.JWT_SECRET_user;
const JWT_SECRET_admin = process.env.JWT_SECRET_admin;

module.exports.userSignup_post = async (req, res) => {
  const { displayName, email, password } = req.body;

  if (!displayName || !email || !password) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'All fields are required.',
      },
    });
  }
  try {
    const savedAdmin = await Admin.findOne({ email });
    if (savedAdmin) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'User cannot be created.',
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
  //   Admin.findOne({ email }).then(savedUser => {
  //     if (savedUser) {
  //       return res.status(400).json({
  //         status: 'error',
  //         error: {
  //           code: 400,
  //           message: 'User cannot be created.',
  //         },
  //       });
  //     }
  //   });
  User.findOne({ email })
    .then(savedUser => {
      if (savedUser) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'User already exist.',
          },
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt
            .hash(password, salt)
            .then(hashedPassword => {
              const user = new User({
                displayName,
                email,
                password: hashedPassword,
              });
              user
                .save()
                .then(user => {
                  const token = jwt.sign({ _id: user._id }, JWT_SECRET_user);
                  const { _id, displayName, displayImage, email } = user;

                  res.json({
                    status: 'success',
                    data: {
                      user: {
                        _id,
                        displayName,
                        displayImage,
                        email,
                        token,
                      },
                    },
                    message: 'User added successfully.',
                  });
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
      }
    })
    .catch(err => console.log(err));
};

module.exports.userSignin_post = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then(savedUser => {
    if (!savedUser) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Invalid user credentials.',
        },
      });
    } else {
      bcrypt.compare(password, savedUser.password).then(doMatch => {
        if (!doMatch) {
          return res.status(400).json({
            status: 'error',
            error: {
              code: 400,
              message: 'Invalid user credentials.',
            },
          });
        } else {
          const {
            _id,
            displayName,
            displayImage,
            email,
            eComm_wallet,
            shippingAddress,
            accountType,
          } = savedUser;
          const token = jwt.sign({ _id }, JWT_SECRET_user);
          return res.json({
            status: 'success',
            data: {
              user: {
                _id,
                displayName,
                displayImage,
                email,
                token,
                eComm_wallet,
                shippingAddress,
                accountType,
              },
            },
            message: 'Sign in success.',
          });
        }
      });
    }
  });
};

module.exports.adminSignup_post = async (req, res) => {
  const { displayName, email, password } = req.body;

  if (!displayName || !email || !password) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'All fields are required.',
      },
    });
  }

  try {
    const savedUser = await User.findOne({ email });
    if (savedUser) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Use different email for admin account.',
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
  //   User.findOne({ email }).then(savedUser => {
  //     if (savedUser) {
  //       return res.status(400).json({
  //         status: 'error',
  //         error: {
  //           code: 400,
  //           message: 'Use different email for admin account.',
  //         },
  //       });
  //     }
  //   });
  Admin.findOne({ email })
    .then(savedAdmin => {
      if (savedAdmin) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Admin already exist.',
          },
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt
            .hash(password, salt)
            .then(hashedPassword => {
              const admin = new Admin({
                displayName,
                email,
                password: hashedPassword,
              });
              admin
                .save()
                .then(admin => {
                  const token = jwt.sign({ _id: admin._id }, JWT_SECRET_admin);
                  const { _id, displayName, displayImage, email } = admin;

                  res.json({
                    status: 'success',
                    data: {
                      admin: {
                        _id,
                        displayName,
                        displayImage,
                        email,
                        token,
                      },
                    },
                    message: 'User added successfully.',
                  });
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        });
      }
    })
    .catch(err => console.log(err));
};

module.exports.adminSignin_post = (req, res) => {
  const { email, password } = req.body;

  Admin.findOne({ email }).then(savedAdmin => {
    if (!savedAdmin) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 400,
          message: 'Invalid user credentials.',
        },
      });
    } else {
      bcrypt.compare(password, savedAdmin.password).then(doMatch => {
        if (!doMatch) {
          return res.status(400).json({
            status: 'error',
            error: {
              code: 400,
              message: 'Invalid user credentials.',
            },
          });
        } else {
          const { _id, displayName, displayImage, email } = savedAdmin;
          const token = jwt.sign({ _id }, JWT_SECRET_admin);
          return res.json({
            status: 'success',
            data: {
              user: {
                _id,
                displayName,
                displayImage,
                email,
                token,
              },
            },
            message: 'Sign in success.',
          });
        }
      });
    }
  });
};
