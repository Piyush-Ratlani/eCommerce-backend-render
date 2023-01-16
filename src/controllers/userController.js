const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.updateUserAddress = (req, res) => {
  const { addresses } = req.body;
  const { userId } = req.params;

  if (addresses) {
    User.findByIdAndUpdate(
      userId,
      { shippingAddress: addresses },
      { new: true }
    )
      .select('-password')
      .then(updatedUser => {
        if (updatedUser) {
          return res.json({
            status: 'success',
            data: {
              user: updatedUser,
            },
            message: 'Address updated.',
          });
        } else {
          return res.status(500).json('Internal server error.');
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Bad request.',
          },
        });
      });
  } else {
    return res.status(400).json({
      status: 'error',
      error: { code: 400, message: 'Please enter address.' },
    });
  }
};
