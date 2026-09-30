const express = require('express');
const router = express.Router();
const Employee = require('../../models/employees');
const EmploymentHistory = require('../../models/EmploymentHistory');
const SalaryHistory = require('../../models/SalaryHistory');
const StipendHistory = require('../../models/StipendHistory');
const StatusHistory = require('../../models/StatusHistory');
const EmployeeTimeline = require('../../models/EmployeeTimeline');


const generateNextEmployeeId = async (company) => {
  const compStr = String(company || '').toLowerCase();
  const prefix = compStr.includes('deep') ? 'DE' :
                 (compStr.includes('swaayatt') || compStr.includes('robot')) ? 'SR' : 'EMP';

  // Find all employees with employee_id matching prefix-number
  const regex = new RegExp(`^${prefix}-\\d+$`, 'i');
  const existing = await Employee.find({ employee_id: regex }, 'employee_id').lean();

  let maxNum = 0;
  existing.forEach(e => {
    if (e.employee_id) {
      const parts = e.employee_id.split('-');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  let candidateNum = maxNum > 0 ? maxNum + 1 : 1;
  let candidateId = `${prefix}-${String(candidateNum).padStart(3, '0')}`;

  while (await Employee.findOne({ employee_id: candidateId })) {
    candidateNum++;
    candidateId = `${prefix}-${String(candidateNum).padStart(3, '0')}`;
  }

  return candidateId;
};

// Endpoint to fetch next auto-generated Employee ID
router.get('/next-employee-id', async (req, res) => {
  try {
    const { company } = req.query;
    const nextId = await generateNextEmployeeId(company);
    res.status(200).json({ success: true, employee_id: nextId });
  } catch (err) {
    console.error("Error generating next employee ID:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/add-employee-personal', async (req, res) => {
  try {
    const {
      employee_id,
      department,
      employment_type,
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
      panNumber,
      aadharNumber,
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
      stipend,
      created_by
    } = req.body;

    const lowerCategory = category?.toLowerCase();
    // Normalize employment_type and category
    let finalEmploymentType = employment_type;
    if (!finalEmploymentType) {
      const lower = category?.toLowerCase();
      if (lower === 'intern') finalEmploymentType = 'Intern';
      else if (lower === 'contractual' || lower === 'contract') finalEmploymentType = 'Contract';
      else finalEmploymentType = 'Full-Time';
    }

    // console.log("➡️  Received personal details for:", name);
    // console.log("   Category:", lowerCategory, "Salary:", salary, "CTC:", ctc, "Stipend:", stipend);
    let finalCategory = category;
    if (!finalCategory) {
      if (finalEmploymentType === 'Intern') finalCategory = 'Intern';
      else if (finalEmploymentType === 'Contract') finalCategory = 'Contractual';
      else finalCategory = 'Full-time';
    }

    // Normalize status: "Current" maps to " Working"
    let finalStatus = status || ' Working';
    if (finalStatus === 'Current' || finalStatus === 'Working') {
      finalStatus = 'Working';
    }

    const joiningDate = dateOfJoining ? new Date(dateOfJoining) : new Date();
    const adminUser = created_by || 'HR Admin';

    const salaryVal = (finalEmploymentType === 'Full-Time' || finalEmploymentType === 'Contract') && salary ? Number(salary) : undefined;
    const stipendVal = (finalEmploymentType === 'Intern') && stipend ? Number(stipend) : undefined;

    let finalEmployeeId = employee_id?.trim();
    if (!finalEmployeeId || finalEmployeeId === 'Auto-generated') {
      finalEmployeeId = await generateNextEmployeeId(company);
    }

    const newEmployee = new Employee({
      employee_id: finalEmployeeId,
      department: department || 'General',
      employment_type: finalEmploymentType,
      category: finalCategory,
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
      panNumber: panNumber?.trim(),
      aadharNumber: aadharNumber?.trim(),
      designation,
      company,
      dateOfJoining: joiningDate,
      dateOfLeaving,
      status: finalStatus,
      education,
      emergencyContact,
      bankDetails: bankDetails ? {
        ...bankDetails,
        branchName: bankDetails.branchName || bankDetails.branchNumber,
        branchNumber: bankDetails.branchName || bankDetails.branchNumber
      } : undefined,
      salary: salaryVal,
      current_salary: salaryVal,
      ctc: finalEmploymentType === 'Full-Time' ? ctc : undefined,
      stipend: stipendVal,
      current_stipend: stipendVal,
    });
    // console.log("➡️ New Employee Added:", newEmployee);

    const savedEmployee = await newEmployee.save();

    // Baseline Employment History
    await EmploymentHistory.create({
      employee_id: savedEmployee._id,
      employment_type: finalEmploymentType,
      start_date: joiningDate,
      end_date: null,
      reason: 'Initial Joining',
      remarks: `Joined as ${finalEmploymentType}`,
      created_by: adminUser
    });

    // Baseline Salary or Stipend History
    if (salaryVal) {
      await SalaryHistory.create({
        employee_id: savedEmployee._id,
        previous_salary: 0,
        new_salary: salaryVal,
        increment_amount: salaryVal,
        increment_percentage: 0,
        effective_date: joiningDate,
        reason: 'Initial Salary',
        remarks: 'Salary upon joining',
        created_by: adminUser
      });
    }

    if (stipendVal) {
      await StipendHistory.create({
        employee_id: savedEmployee._id,
        previous_stipend: 0,
        new_stipend: stipendVal,
        increment_amount: stipendVal,
        increment_percentage: 0,
        effective_date: joiningDate,
        reason: 'Initial Stipend',
        remarks: 'Stipend upon joining internship',
        created_by: adminUser
      });
    }

    // Baseline Status History
    await StatusHistory.create({
      employee_id: savedEmployee._id,
      previous_status: 'None',
      new_status: finalStatus,
      effective_date: joiningDate,
      reason: 'Initial Employment Status',
      remarks: 'Employee registered',
      created_by: adminUser
    });

    // Baseline Timeline Event
    const compDesc = finalEmploymentType === 'Intern'
      ? (stipendVal ? `Stipend: ₹${stipendVal.toLocaleString('en-IN')}` : '')
      : (salaryVal ? `Salary: ₹${salaryVal.toLocaleString('en-IN')}` : '');

    await EmployeeTimeline.create({
      employee_id: savedEmployee._id,
      event_type: 'EMPLOYEE_JOINED',
      title: `Joined as ${finalEmploymentType}`,
      description: `Joined ${company || 'the organization'} as ${designation || finalEmploymentType}. ${compDesc}`,
      metadata: {
        employment_type: finalEmploymentType,
        status: finalStatus,
        salary: salaryVal,
        stipend: stipendVal,
        dateOfJoining: joiningDate
      },
      event_date: joiningDate,
      created_by: adminUser
    });

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
