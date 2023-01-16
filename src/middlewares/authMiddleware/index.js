const requireUserLogin = require('./requireUserLogin');
const requireAdminLogin = require('./requireAdminLogin');

module.exports = (req, res, next) => {
  if (req.params.accountType === 'client') {
    return requireUserLogin(req, res, next);
  } else if (req.params.accountType === 'admin') {
    return requireAdminLogin(req, res, next);
  } else {
    return res.status(403).json({
      status: 'error',
      error: {
        code: 403,
        message: 'Invalid access.',
      },
    });
  }
};
