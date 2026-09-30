const Employee = require('./../../models/employees');
const Document = require('../../models/documents');

exports.getAllEmployeesWithDetails = async (req, res) => {
  try {
    const { companyFilter } = req.query;
    let filter = {}; 

    if (companyFilter) {
      filter.company = companyFilter; 
    }


    const employees = await Employee.find(filter) 
      // .populate('category')
      .lean(); 

    // Extract employee IDs to find their associated documents
    const employeeIds = employees.map(emp => emp._id);

    // Find documents related to the fetched employees
    const documents = await Document.find({ employeeId: { $in: employeeIds } }).lean();

    const docMap = {};
    documents.forEach(doc => {
      docMap[doc.employeeId.toString()] = doc;
    });

    const result = employees.map(emp => ({
      ...emp,
      employment_type: emp.employment_type || (emp.category === 'Intern' ? 'Intern' : emp.category === 'Contractual' ? 'Contract' : 'Full-Time'),
      status: (emp.status === 'Current' || emp.status === 'Working') ? ' Working' : emp.status,
      current_salary: emp.current_salary || emp.salary || 0,
      current_stipend: emp.current_stipend || emp.stipend || 0,
      documents: docMap[emp._id.toString()] || null 
    }));

    // console.log("api data_:", result); 
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching employees:', err); 
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};