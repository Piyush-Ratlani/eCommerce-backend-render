const mongoose = require('mongoose');
const Category = mongoose.model('Category');

module.exports.addCategory_post = (req, res) => {
  const { name, description, displayImage } = req.body;

  if (!name || !displayImage) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 400,
        message: 'Add category name and image.',
      },
    });
  } else {
    Category.findOne({ name }).then(savedCateg => {
      if (savedCateg) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Category already exists.',
          },
        });
      } else {
        const category = new Category({
          name,
          description,
          displayImage,
        });
        category
          .save()
          .then(savedCateg => {
            const { name, description, displayImage } = savedCateg;

            return res.json({
              status: 'success',
              data: {
                category: {
                  name,
                  description,
                  displayImage,
                },
              },
            });
          })
          .catch(err => console.log(err));
      }
    });
  }
};

module.exports.allCategory_get = (req, res) => {
  Category.find()
    .sort('name')
    .then(categories => {
      return res.json({
        status: 'success',
        data: { categories },
      });
    })
    .catch(err => console.log(err));
};
