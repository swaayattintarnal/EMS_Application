const express = require('express');
const router = express.Router(); 

const mongoose = require('mongoose');
const adminLogin = require('./login_authentication/adminlogin');
const adminRegister = require('./login_authentication/adminRegister');
const addCatagory = require('./catagory/addCatagory');
const addCompany = require('./company/addCompany');
const add_employee = require('./employee/addEmployeePersonalDetails');
const { addDocument } = require('./employee/addEmployeeDocuments');
const multiUpload = require('./multer_config/multer_config');
const { getAllEmployeesWithDetails } = require('./employee/getAllEmployees');
const { getEmployeeDetailsById } = require('./employee/getOneEmpData');
const { deleteEmployeeDocument } = require('./employee/deleteEmployeeDocument');
const { uploadDocument } = require('./employee/uploadNewFile');
const { updateEmployee } = require('./employee/updateEmployee');
const { addConfidentialDocs, deleteConfidentialDocument, getConfidentialDocuments } = require('./employee/confidentialDocsHandler');

const adminRoutes = require('./adminRoutes'); 

const Employee = require('../models/employees'); 

router.use('/admins', adminRoutes);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/admin-login', adminLogin);
router.post('/admin-registration', adminRegister);
router.post('/add-catagory', addCatagory);
router.post('/add-company', addCompany);
router.post('/add-employee-personal', add_employee);
router.post('/add-documents', multiUpload, addDocument);
router.get('/get-all-employees', getAllEmployeesWithDetails);
router.get('/get-one-emp-data/:id', getEmployeeDetailsById);
router.delete('/delete-employee-document/:employeeId/:category/:fileName', deleteEmployeeDocument);
router.put('/update-employee/:id', updateEmployee);

router.post('/upload-confidential-document/:employeeId', multiUpload, addConfidentialDocs);
router.delete('/delete-confidential-document/:employeeId/:fileName', deleteConfidentialDocument);
router.get('/get-confidential-documents/:employeeId', getConfidentialDocuments);

router.post('/upload-document', multiUpload, uploadDocument);

router.post('/update-access-control/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params; 
    const { adminId, adminLevel, access } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    let existing = employee.accessControl.find(ac => String(ac.adminId) === String(adminId));

    if (existing) {
      Object.assign(existing, access);
      existing.adminLevel = adminLevel;
      existing.employeeId = employeeId; 
    } else {
      employee.accessControl.push({ adminId, adminLevel, employeeId, ...access });
    }

    employee.accessControl.forEach(ac => {
      if (!ac.employeeId) {
        ac.employeeId = employeeId;
      }
    });

    await employee.save();
    res.json({ success: true, message: "Access updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating access", details: err.message });
  }
});


module.exports = router;