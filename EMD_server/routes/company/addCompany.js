const Company = require('../../models/company');

module.exports = async (req, res) => {
  try {
    const { name } = req.body;

    const company = new Company({ name });
    const savedCompany = await company.save();

    res.status(201).json({ message: 'Company created', data: savedCompany });
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ error: 'Failed to add company', details: error.message });
  }
};