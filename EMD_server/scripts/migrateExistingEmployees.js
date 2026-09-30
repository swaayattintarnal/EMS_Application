const mongoose = require('mongoose');
const Employee = require('../models/employees');
const EmploymentHistory = require('../models/EmploymentHistory');
const SalaryHistory = require('../models/SalaryHistory');
const StipendHistory = require('../models/StipendHistory');
const StatusHistory = require('../models/StatusHistory');
const EmployeeTimeline = require('../models/EmployeeTimeline');

const MONGO_URI = "mongodb://127.0.0.1:27017/EMD_DB";

async function runMigration() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB.");

    const employees = await Employee.find({});
    console.log(`Found ${employees.length} existing employees to inspect/migrate.`);

    for (const emp of employees) {
      console.log(`\nProcessing employee: ${emp.name} (${emp._id})`);

      let updated = false;

      // 1. Employment Type
      if (!emp.employment_type) {
        const cat = (emp.category || '').toLowerCase();
        if (cat === 'intern') emp.employment_type = 'Intern';
        else if (cat === 'contractual' || cat === 'contract') emp.employment_type = 'Contract';
        else emp.employment_type = 'Full-Time';
        updated = true;
      }

      // 2. Status normalization
      if (!emp.status || emp.status === 'Current' || emp.status === 'Working') {
        emp.status = ' Working';
        updated = true;
      }

      // 3. Employee ID
      if (!emp.employee_id) {
        emp.employee_id = `EMP-${emp._id.toString().slice(-6).toUpperCase()}`;
        updated = true;
      }

      // 4. Department
      if (!emp.department) {
        emp.department = 'Engineering';
        updated = true;
      }

      // 5. Current Salary / Current Stipend
      if (emp.salary && !emp.current_salary) {
        emp.current_salary = emp.salary;
        updated = true;
      }
      if (emp.stipend && !emp.current_stipend) {
        emp.current_stipend = emp.stipend;
        updated = true;
      }

      if (updated) {
        await emp.save();
        console.log(`  Updated base fields for ${emp.name}`);
      }

      const joiningDate = emp.dateOfJoining || emp.createdAt || new Date();

      // 6. Check/Create EmploymentHistory
      const existingEmpHistory = await EmploymentHistory.findOne({ employee_id: emp._id });
      if (!existingEmpHistory) {
        await EmploymentHistory.create({
          employee_id: emp._id,
          employment_type: emp.employment_type,
          start_date: joiningDate,
          end_date: emp.status === 'Left' || emp.status === 'Resigned' ? (emp.dateOfLeaving || new Date()) : null,
          reason: 'Initial Record (Migrated)',
          remarks: `Migrated employment record for ${emp.employment_type}`,
          created_by: 'System Migration'
        });
        console.log(`  Created EmploymentHistory for ${emp.name}`);
      }

      // 7. Check/Create SalaryHistory
      if (emp.current_salary && emp.current_salary > 0) {
        const existingSalHistory = await SalaryHistory.findOne({ employee_id: emp._id });
        if (!existingSalHistory) {
          await SalaryHistory.create({
            employee_id: emp._id,
            previous_salary: 0,
            new_salary: emp.current_salary,
            increment_amount: emp.current_salary,
            increment_percentage: 0,
            effective_date: joiningDate,
            reason: 'Base Salary',
            remarks: 'Initial migrated salary record',
            created_by: 'System Migration'
          });
          console.log(`  Created SalaryHistory for ${emp.name} (₹${emp.current_salary})`);
        }
      }

      // 8. Check/Create StipendHistory
      if (emp.current_stipend && emp.current_stipend > 0) {
        const existingStipHistory = await StipendHistory.findOne({ employee_id: emp._id });
        if (!existingStipHistory) {
          await StipendHistory.create({
            employee_id: emp._id,
            previous_stipend: 0,
            new_stipend: emp.current_stipend,
            increment_amount: emp.current_stipend,
            increment_percentage: 0,
            effective_date: joiningDate,
            reason: 'Base Stipend',
            remarks: 'Initial migrated stipend record',
            created_by: 'System Migration'
          });
          console.log(`  Created StipendHistory for ${emp.name} (₹${emp.current_stipend})`);
        }
      }

      // 9. Check/Create StatusHistory
      const existingStatusHistory = await StatusHistory.findOne({ employee_id: emp._id });
      if (!existingStatusHistory) {
        await StatusHistory.create({
          employee_id: emp._id,
          previous_status: 'None',
          new_status: emp.status,
          effective_date: joiningDate,
          reason: 'Initial Status',
          remarks: 'Migrated status',
          created_by: 'System Migration'
        });
        console.log(`  Created StatusHistory for ${emp.name} (${emp.status})`);
      }

      // 10. Check/Create Timeline Event
      const existingTimeline = await EmployeeTimeline.findOne({ employee_id: emp._id });
      if (!existingTimeline) {
        const compDesc = emp.employment_type === 'Intern'
          ? (emp.current_stipend ? `Stipend: ₹${emp.current_stipend.toLocaleString('en-IN')}` : '')
          : (emp.current_salary ? `Salary: ₹${emp.current_salary.toLocaleString('en-IN')}` : '');

        await EmployeeTimeline.create({
          employee_id: emp._id,
          event_type: 'EMPLOYEE_JOINED',
          title: `Joined as ${emp.employment_type}`,
          description: `Joined ${emp.company} as ${emp.designation || emp.employment_type}. ${compDesc}`,
          metadata: {
            employment_type: emp.employment_type,
            status: emp.status,
            salary: emp.current_salary,
            stipend: emp.current_stipend,
            dateOfJoining: joiningDate
          },
          event_date: joiningDate,
          created_by: 'System Migration'
        });
        console.log(`  Created initial Timeline entry for ${emp.name}`);
      }
    }

    console.log("\nMigration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();

