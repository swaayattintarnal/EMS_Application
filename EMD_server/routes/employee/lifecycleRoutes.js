const express = require('express');
const router = express.Router({ mergeParams: true });
const Employee = require('../../models/employees');
const EmploymentHistory = require('../../models/EmploymentHistory');
const SalaryHistory = require('../../models/SalaryHistory');
const StipendHistory = require('../../models/StipendHistory');
const StatusHistory = require('../../models/StatusHistory');
const EmployeeTimeline = require('../../models/EmployeeTimeline');

// Allowed status mapping per employment type
const ALLOWED_STATUSES = {
  'Intern': ['Working', 'Internship Completion', 'Left', 'Current'],
  'Full-Time': [' Working', 'Notice Period', 'Resigned', 'Current'],
  'Contract': ['Working', 'Left', 'Current']
};

// Normalize status: "Current" maps to " Working"
const normalizeStatus = (status) => {
  if (status === 'Current' || status === 'Working') return 'Working';
  return status;
};

// Map employment_type to legacy category
const mapTypeToCategory = (type) => {
  if (type === 'Full-Time') return 'Full-time';
  if (type === 'Intern') return 'Intern';
  if (type === 'Contract') return 'Contractual';
  return type;
};

// 1. UPDATE EMPLOYEE STATUS
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    let { status, effective_date, reason, remarks, created_by, noticePeriod, resignationDetails, last_working_date } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const normalizedNewStatus = normalizeStatus(status);
    const empType = employee.employment_type || (employee.category === 'Intern' ? 'Intern' : employee.category === 'Contractual' ? 'Contract' : 'Full-Time');
    const allowed = ALLOWED_STATUSES[empType] || [];

    if (!allowed.includes(normalizedNewStatus) && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status '${status}' is not allowed for employment type '${empType}'. Allowed statuses: ${allowed.filter(s => s !== 'Current').join(', ')}`
      });
    }

    const previousStatus = normalizeStatus(employee.status);
    const effDate = effective_date ? new Date(effective_date) : new Date();
    const adminUser = created_by || 'HR Admin';

    // Status History
    await StatusHistory.create({
      employee_id: employee._id,
      previous_status: previousStatus,
      new_status: normalizedNewStatus,
      effective_date: effDate,
      reason,
      remarks,
      created_by: adminUser
    });

    // Update specific status fields on Employee
    employee.status = normalizedNewStatus;

    let timelineEventType = 'STATUS_CHANGED';
    let timelineTitle = `Status Changed to ${normalizedNewStatus}`;
    let timelineDescription = reason || `Status updated from ${previousStatus} to ${normalizedNewStatus}`;

    if (normalizedNewStatus === 'Notice Period') {
      timelineEventType = 'NOTICE_PERIOD_STARTED';
      timelineTitle = 'Notice Period Started';
      const npData = noticePeriod || {};
      employee.noticePeriod = {
        startDate: npData.startDate ? new Date(npData.startDate) : effDate,
        duration: npData.duration || '30 Days',
        expectedLastWorkingDate: npData.expectedLastWorkingDate ? new Date(npData.expectedLastWorkingDate) : null,
        actualLastWorkingDate: npData.actualLastWorkingDate ? new Date(npData.actualLastWorkingDate) : null,
        reason: reason || npData.reason,
        remarks: remarks || npData.remarks
      };
      timelineDescription = `Notice period started (${employee.noticePeriod.duration}). Expected LWD: ${employee.noticePeriod.expectedLastWorkingDate ? employee.noticePeriod.expectedLastWorkingDate.toLocaleDateString() : 'N/A'}`;
    } else if (normalizedNewStatus === 'Resigned') {
      timelineEventType = 'RESIGNED';
      timelineTitle = 'Employee Resigned';
      const resData = resignationDetails || {};
      employee.resignationDetails = {
        resignationDate: resData.resignationDate ? new Date(resData.resignationDate) : effDate,
        noticePeriodStartDate: resData.noticePeriodStartDate ? new Date(resData.noticePeriodStartDate) : employee.noticePeriod?.startDate,
        lastWorkingDate: resData.lastWorkingDate ? new Date(resData.lastWorkingDate) : (last_working_date ? new Date(last_working_date) : effDate),
        exitDate: resData.exitDate ? new Date(resData.exitDate) : effDate,
        reason: reason || resData.reason,
        remarks: remarks || resData.remarks
      };
      employee.last_working_date = employee.resignationDetails.lastWorkingDate;
      employee.dateOfLeaving = employee.resignationDetails.lastWorkingDate;
      timelineDescription = `Resignation processed. Last working date: ${employee.last_working_date.toLocaleDateString()}`;
    } else if (normalizedNewStatus === 'Left') {
      timelineEventType = 'LEFT';
      timelineTitle = 'Employee Left';
      employee.last_working_date = last_working_date ? new Date(last_working_date) : effDate;
      employee.dateOfLeaving = employee.last_working_date;
      timelineDescription = `Employee left. Last working date: ${employee.last_working_date.toLocaleDateString()}`;
    } else if (normalizedNewStatus === 'Internship Completion') {
      timelineEventType = 'INTERNSHIP_COMPLETED';
      timelineTitle = 'Internship Completed';
      employee.last_working_date = last_working_date ? new Date(last_working_date) : effDate;
      employee.dateOfLeaving = employee.last_working_date;
      timelineDescription = reason || `Internship successfully completed. Completion date: ${employee.last_working_date.toLocaleDateString()}`;
    }

    // Record Timeline Event
    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: timelineEventType,
      title: timelineTitle,
      description: timelineDescription,
      metadata: {
        previous_status: previousStatus,
        new_status: normalizedNewStatus,
        reason,
        remarks
      },
      event_date: effDate,
      created_by: adminUser
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee status successfully updated to ${normalizedNewStatus}`,
      data: employee
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. SALARY INCREMENT (Full-Time / Contract)
router.post('/:id/salary/increase', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_salary, effective_date, reason, remarks, created_by } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const previous_salary = employee.current_salary || employee.salary || 0;
    const newSalaryNum = Number(new_salary);

    if (isNaN(newSalaryNum) || newSalaryNum <= 0) {
      return res.status(400).json({ success: false, message: 'A valid new salary greater than 0 is required.' });
    }

    if (previous_salary > 0 && newSalaryNum <= previous_salary) {
      return res.status(400).json({
        success: false,
        message: `New salary (₹${newSalaryNum}) must be greater than current salary (₹${previous_salary}).`
      });
    }

    const increment_amount = previous_salary > 0 ? (newSalaryNum - previous_salary) : 0;
    const increment_percentage = previous_salary > 0 ? Number(((increment_amount / previous_salary) * 100).toFixed(2)) : 0;
    const effDate = effective_date ? new Date(effective_date) : new Date();
    const adminUser = created_by || 'HR Admin';

    // 1. Create SalaryHistory record
    const salaryRecord = await SalaryHistory.create({
      employee_id: employee._id,
      previous_salary,
      new_salary: newSalaryNum,
      increment_amount,
      increment_percentage,
      effective_date: effDate,
      reason: reason || 'Salary Increment',
      remarks,
      created_by: adminUser
    });

    // 2. Update Employee
    employee.current_salary = newSalaryNum;
    employee.salary = newSalaryNum;
    await employee.save();

    // 3. Create Timeline Event
    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: 'SALARY_INCREASED',
      title: 'Salary Increased',
      description: previous_salary > 0
        ? `Salary revised: ₹${previous_salary.toLocaleString('en-IN')} → ₹${newSalaryNum.toLocaleString('en-IN')} (+₹${increment_amount.toLocaleString('en-IN')}, ${increment_percentage}%)`
        : `Salary set to ₹${newSalaryNum.toLocaleString('en-IN')}`,
      metadata: {
        previous_salary,
        new_salary: newSalaryNum,
        increment_amount,
        increment_percentage,
        reason,
        remarks
      },
      event_date: effDate,
      created_by: adminUser
    });

    res.status(200).json({
      success: true,
      message: 'Salary increment recorded successfully.',
      data: {
        current_salary: newSalaryNum,
        history: salaryRecord
      }
    });
  } catch (error) {
    console.error('Error increasing salary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2b. CONTRACT COMPENSATION REVISION
router.post('/:id/contract/compensation', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_compensation, effective_date, reason, remarks, created_by } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const previous_salary = employee.current_salary || employee.salary || 0;
    const newCompNum = Number(new_compensation);

    if (isNaN(newCompNum) || newCompNum <= 0) {
      return res.status(400).json({ success: false, message: 'A valid compensation amount greater than 0 is required.' });
    }

    const increment_amount = previous_salary > 0 ? (newCompNum - previous_salary) : 0;
    const increment_percentage = previous_salary > 0 ? Number(((increment_amount / previous_salary) * 100).toFixed(2)) : 0;
    const effDate = effective_date ? new Date(effective_date) : new Date();
    const adminUser = created_by || 'HR Admin';

    const historyRecord = await SalaryHistory.create({
      employee_id: employee._id,
      previous_salary,
      new_salary: newCompNum,
      increment_amount,
      increment_percentage,
      effective_date: effDate,
      reason: reason || 'Contract Compensation Revision',
      remarks,
      created_by: adminUser
    });

    employee.current_salary = newCompNum;
    employee.salary = newCompNum;
    if (employee.contractDetails) {
      employee.contractDetails.payment = newCompNum;
    }
    await employee.save();

    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: 'CONTRACT_COMPENSATION_CHANGED',
      title: 'Contract Compensation Revised',
      description: previous_salary > 0
        ? `Contract compensation revised: ₹${previous_salary.toLocaleString('en-IN')} → ₹${newCompNum.toLocaleString('en-IN')}`
        : `Contract compensation set to ₹${newCompNum.toLocaleString('en-IN')}`,
      metadata: {
        previous_salary,
        new_salary: newCompNum,
        increment_amount,
        increment_percentage,
        reason,
        remarks
      },
      event_date: effDate,
      created_by: adminUser
    });

    res.status(200).json({
      success: true,
      message: 'Contract compensation revision recorded successfully.',
      data: {
        current_salary: newCompNum,
        history: historyRecord
      }
    });
  } catch (error) {
    console.error('Error updating contract compensation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET SALARY HISTORY
router.get('/:id/salary-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await SalaryHistory.find({ employee_id: id }).sort({ effective_date: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. STIPEND INCREMENT (Intern)
router.post('/:id/stipend/increase', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_stipend, effective_date, reason, remarks, created_by } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const previous_stipend = employee.current_stipend || employee.stipend || 0;
    const newStipendNum = Number(new_stipend);

    if (isNaN(newStipendNum) || newStipendNum <= 0) {
      return res.status(400).json({ success: false, message: 'A valid new stipend greater than 0 is required.' });
    }

    if (previous_stipend > 0 && newStipendNum <= previous_stipend) {
      return res.status(400).json({
        success: false,
        message: `New stipend (₹${newStipendNum}) must be greater than current stipend (₹${previous_stipend}).`
      });
    }

    const increment_amount = previous_stipend > 0 ? (newStipendNum - previous_stipend) : 0;
    const increment_percentage = previous_stipend > 0 ? Number(((increment_amount / previous_stipend) * 100).toFixed(2)) : 0;
    const effDate = effective_date ? new Date(effective_date) : new Date();
    const adminUser = created_by || 'HR Admin';

    // 1. Create StipendHistory record
    const stipendRecord = await StipendHistory.create({
      employee_id: employee._id,
      previous_stipend,
      new_stipend: newStipendNum,
      increment_amount,
      increment_percentage,
      effective_date: effDate,
      reason: reason || 'Stipend Increment',
      remarks,
      created_by: adminUser
    });

    // 2. Update Employee
    employee.current_stipend = newStipendNum;
    employee.stipend = newStipendNum;
    await employee.save();

    // 3. Create Timeline Event
    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: 'STIPEND_INCREASED',
      title: 'Stipend Increased',
      description: previous_stipend > 0
        ? `Stipend revised: ₹${previous_stipend.toLocaleString('en-IN')} → ₹${newStipendNum.toLocaleString('en-IN')} (+₹${increment_amount.toLocaleString('en-IN')}, ${increment_percentage}%)`
        : `Stipend set to ₹${newStipendNum.toLocaleString('en-IN')}`,
      metadata: {
        previous_stipend,
        new_stipend: newStipendNum,
        increment_amount,
        increment_percentage,
        reason,
        remarks
      },
      event_date: effDate,
      created_by: adminUser
    });

    res.status(200).json({
      success: true,
      message: 'Stipend increment recorded successfully.',
      data: {
        current_stipend: newStipendNum,
        history: stipendRecord
      }
    });
  } catch (error) {
    console.error('Error increasing stipend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET STIPEND HISTORY
router.get('/:id/stipend-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await StipendHistory.find({ employee_id: id }).sort({ effective_date: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. INTERN TO FULL-TIME CONVERSION
router.post('/:id/convert-to-full-time', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_salary, conversion_date, reason, remarks, created_by, designation } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const currentType = employee.employment_type || (employee.category === 'Intern' ? 'Intern' : 'Full-Time');
    if (currentType !== 'Intern') {
      return res.status(400).json({
        success: false,
        message: `Employee is currently '${currentType}'. Only Interns can be converted using this endpoint.`
      });
    }

    const newSalaryNum = Number(new_salary);
    if (isNaN(newSalaryNum) || newSalaryNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valid new full-time salary is required.' });
    }

    const convDate = conversion_date ? new Date(conversion_date) : new Date();
    const adminUser = created_by || 'HR Admin';
    const previousStipend = employee.current_stipend || employee.stipend || 0;

    // 1. Close current Intern EmploymentHistory
    const activeInternHistory = await EmploymentHistory.findOne({
      employee_id: employee._id,
      employment_type: 'Intern',
      end_date: null
    }).sort({ createdAt: -1 });

    if (activeInternHistory) {
      activeInternHistory.end_date = convDate;
      activeInternHistory.remarks = 'Converted to Full-Time';
      await activeInternHistory.save();
    } else {
      // If none existed, create historical intern record
      await EmploymentHistory.create({
        employee_id: employee._id,
        employment_type: 'Intern',
        start_date: employee.dateOfJoining || employee.createdAt,
        end_date: convDate,
        reason: 'Internship completed',
        remarks: 'Converted to Full-Time',
        created_by: adminUser
      });
    }

    // 2. Create new Full-Time EmploymentHistory
    await EmploymentHistory.create({
      employee_id: employee._id,
      employment_type: 'Full-Time',
      start_date: convDate,
      end_date: null,
      reason: reason || 'Successful Internship Completion',
      remarks: remarks || `Promoted to Full-Time with salary ₹${newSalaryNum}`,
      created_by: adminUser
    });

    // 3. Create initial SalaryHistory record
    await SalaryHistory.create({
      employee_id: employee._id,
      previous_salary: 0,
      new_salary: newSalaryNum,
      increment_amount: newSalaryNum,
      increment_percentage: 0,
      effective_date: convDate,
      reason: reason || 'Conversion to Full-Time Salary',
      remarks: remarks || `Converted from Intern (Previous Stipend: ₹${previousStipend})`,
      created_by: adminUser
    });

    // 4. Update Employee
    employee.employment_type = 'Full-Time';
    employee.category = 'Full-time';
    employee.status = ' Working';
    employee.current_salary = newSalaryNum;
    employee.salary = newSalaryNum;
    if (designation) {
      employee.designation = designation;
    }
    await employee.save();

    // 5. Create Timeline Event
    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: 'INTERN_CONVERTED_TO_FULL_TIME',
      title: 'Converted from Intern to Full-Time',
      description: `Converted to Full-Time with starting salary ₹${newSalaryNum.toLocaleString('en-IN')}/month. (Previous Stipend: ₹${previousStipend.toLocaleString('en-IN')})`,
      metadata: {
        previous_employment_type: 'Intern',
        new_employment_type: 'Full-Time',
        previous_stipend: previousStipend,
        new_salary: newSalaryNum,
        conversion_date: convDate,
        reason,
        remarks
      },
      event_date: convDate,
      created_by: adminUser
    });

    res.status(200).json({
      success: true,
      message: 'Employee successfully converted to Full-Time.',
      data: employee
    });
  } catch (error) {
    console.error('Error converting intern to full-time:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. UPDATE EMPLOYMENT TYPE
router.put('/:id/employment-type', async (req, res) => {
  try {
    const { id } = req.params;
    const { employment_type, effective_date, reason, remarks, created_by } = req.body;

    if (!['Intern', 'Full-Time', 'Contract'].includes(employment_type)) {
      return res.status(400).json({ success: false, message: 'Invalid employment type. Must be Intern, Full-Time, or Contract.' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const previousType = employee.employment_type || (employee.category === 'Intern' ? 'Intern' : employee.category === 'Contractual' ? 'Contract' : 'Full-Time');
    const effDate = effective_date ? new Date(effective_date) : new Date();
    const adminUser = created_by || 'HR Admin';

    if (previousType === employment_type) {
      return res.status(400).json({ success: false, message: `Employee is already ${employment_type}.` });
    }

    // Close active employment record
    await EmploymentHistory.updateMany(
      { employee_id: employee._id, end_date: null },
      { $set: { end_date: effDate } }
    );

    // Create new employment history
    await EmploymentHistory.create({
      employee_id: employee._id,
      employment_type,
      start_date: effDate,
      reason,
      remarks,
      created_by: adminUser
    });

    // Update Employee document
    employee.employment_type = employment_type;
    employee.category = mapTypeToCategory(employment_type);
    await employee.save();

    // Record Timeline
    await EmployeeTimeline.create({
      employee_id: employee._id,
      event_type: 'EMPLOYMENT_TYPE_CHANGED',
      title: `Employment Type Changed to ${employment_type}`,
      description: `Transitioned from ${previousType} to ${employment_type}`,
      metadata: {
        previous_type: previousType,
        new_type: employment_type,
        reason,
        remarks
      },
      event_date: effDate,
      created_by: adminUser
    });

    res.status(200).json({
      success: true,
      message: `Employment type updated to ${employment_type}`,
      data: employee
    });
  } catch (error) {
    console.error('Error updating employment type:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET EMPLOYMENT HISTORY
router.get('/:id/employment-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await EmploymentHistory.find({ employee_id: id }).sort({ start_date: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. GET STATUS HISTORY
router.get('/:id/status-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await StatusHistory.find({ employee_id: id }).sort({ effective_date: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. GET CHRONOLOGICAL TIMELINE
router.get('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await EmployeeTimeline.find({ employee_id: id }).sort({ event_date: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

