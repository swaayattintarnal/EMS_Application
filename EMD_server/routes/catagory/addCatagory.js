const Category = require('../../models/role_catagory');

module.exports = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = new Category({ name, description });
    const savedCategory = await category.save();

    res.status(201).json({ message: 'Category created', data: savedCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category', details: error.message });
  }
};
