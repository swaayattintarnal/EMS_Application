const express = require('express');
const router = express.Router();
const Employee = require('../../models/employees');


router.post('/add-employee-personal', async (req, res) => {
  try {
    const {
      name,
      contact,
      address,
      email,
      dateOfBirth,
      companyEmail,
      permanentAddress,
      birthPlace,
      nationality,
      fatherName,
      motherName,
      bloodGroup,
      designation,
      company,
      category,
      dateOfJoining,
      dateOfLeaving,
      status,
      education,
      emergencyContact,
      bankDetails,
      salary,
      ctc,
      stipend
    } = req.body;

    const lowerCategory = category?.toLowerCase();

    // console.log("➡️  Received personal details for:", name);
    // console.log("   Category:", lowerCategory, "Salary:", salary, "CTC:", ctc, "Stipend:", stipend);

    const newEmployee = new Employee({
      name,
      contact,
      address,
      email,
      dateOfBirth,
      companyEmail,
      permanentAddress,
      birthPlace,
      nationality,
      fatherName,
      motherName,
      bloodGroup,
      designation,
      company,
      category,
      dateOfJoining,
      dateOfLeaving,
      status,
      education,
      emergencyContact,
      bankDetails,
      salary: lowerCategory === 'full-time' ? salary : undefined,
      ctc: lowerCategory === 'full-time' ? ctc : undefined,
      stipend: (lowerCategory === 'intern' || lowerCategory === 'contractual') ? stipend : undefined,
    });
    // console.log("➡️ New Employee Added:", newEmployee);

    const savedEmployee = await newEmployee.save();

    res.status(200).json({
      success: true,
      message: 'Employee personal details added successfully.',
      data: savedEmployee
    });
  } catch (err) {
    console.error("❌ Error adding employee personal details:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to add employee personal details.',
      error: err.message
    });
  }
});

module.exports = router;
