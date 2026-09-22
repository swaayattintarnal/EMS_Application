const express = require('express');
const router = express.Router();
const AdminModel = require('../models/admin'); 

router.get('/', async (req, res) => {
  try {
    const admins = await AdminModel.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

router.get('/:adminName', async (req, res) => {
  try {
    const admin = await AdminModel.findOne({ name: req.params.adminName });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin' });
  }
});

module.exports = router;
