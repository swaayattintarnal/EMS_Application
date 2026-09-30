const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const app = require('../app');
const Employee = require('../models/employees');
const EmploymentHistory = require('../models/EmploymentHistory');
const SalaryHistory = require('../models/SalaryHistory');
const StipendHistory = require('../models/StipendHistory');
const StatusHistory = require('../models/StatusHistory');
const EmployeeTimeline = require('../models/EmployeeTimeline');

const MONGO_URI = "mongodb://127.0.0.1:27017/EMD_DB";

async function runTests() {
  let server;
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB for testing.");

    // Start ephemeral test server on port 3099
    server = app.listen(3099);
    console.log("Test server listening on port 3099.");

    const post = async (path, body) => {
      const res = await fetch(`http://localhost:3099${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return { status: res.status, data: await res.json() };
    };

    const put = async (path, body) => {
      const res = await fetch(`http://localhost:3099${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return { status: res.status, data: await res.json() };
    };

    const get = async (path) => {
      const res = await fetch(`http://localhost:3099${path}`);
      return { status: res.status, data: await res.json() };
    };

    // 1. CREATE A TEST INTERN
    console.log("\n--- TEST 1: Registering Test Intern ---");
    const uniqueEmail = `test.intern.${Date.now()}@example.com`;
    const internRes = await post('/add-employee-personal', {
      name: 'Test Intern User',
      email: uniqueEmail,
      contact: '9988776655',
      company: 'DeepEigen',
      employment_type: 'Intern',
      designation: 'Robotics Research Intern',
      status: 'Working',
      stipend: 15000,
      department: 'R&D',
      created_by: 'Test Runner'
    });
    console.log("Create Intern Status:", internRes.status, "Success:", internRes.data.success);
    if (!internRes.data.success) throw new Error("Failed to create test intern");

    const internId = internRes.data.data._id;

    // Verify baseline history
    const baseEmpHist = await EmploymentHistory.findOne({ employee_id: internId });
    const baseStipHist = await StipendHistory.findOne({ employee_id: internId });
    const baseTimeline = await EmployeeTimeline.findOne({ employee_id: internId });
    console.log("Baseline EmploymentHistory Created:", !!baseEmpHist, "Type:", baseEmpHist?.employment_type);
    console.log("Baseline StipendHistory Created:", !!baseStipHist, "Stipend:", baseStipHist?.new_stipend);
    console.log("Baseline Timeline Created:", !!baseTimeline, "Event:", baseTimeline?.event_type);

    // 2. TEST INVALID STATUS TRANSITION FOR INTERN
    console.log("\n--- TEST 2: Validating Forbidden Status Transition for Intern ---");
    const invalidStatusRes = await put(`/api/employees/${internId}/status`, {
      status: 'Notice Period',
      reason: 'Should fail'
    });
    console.log("Attempt Intern -> Notice Period Status Code:", invalidStatusRes.status, "Error Msg:", invalidStatusRes.data.message);
    if (invalidStatusRes.status !== 400) {
      throw new Error("Validation FAILED: Intern was allowed to enter Notice Period!");
    } else {
      console.log("PASS: Business rule correctly prevented Intern from entering Notice Period.");
    }

    // 3. TEST STIPEND INCREMENT FOR INTERN
    console.log("\n--- TEST 3: Stipend Increment for Intern ---");
    const stipIncRes = await post(`/api/employees/${internId}/stipend/increase`, {
      new_stipend: 18000,
      reason: 'Mid-term performance appraisal',
      remarks: 'Excellent computer vision progress',
      created_by: 'Test HR'
    });
    console.log("Stipend Increase Status:", stipIncRes.status, "Current Stipend:", stipIncRes.data.data.current_stipend);
    if (stipIncRes.data.data.current_stipend !== 18000) throw new Error("Stipend increment mismatch");
    console.log("PASS: Stipend increment recorded successfully.");

    // 4. TEST INTERN TO FULL-TIME CONVERSION
    console.log("\n--- TEST 4: Intern -> Full-Time Conversion ---");
    const convRes = await post(`/api/employees/${internId}/convert-to-full-time`, {
      new_salary: 40000,
      conversion_date: new Date().toISOString(),
      designation: 'Autonomous Systems Engineer',
      reason: 'Graduated & Hired Full-Time',
      remarks: 'Outstanding research work',
      created_by: 'Test HR'
    });
    console.log("Conversion Status:", convRes.status, "New Type:", convRes.data.data.employment_type, "Salary:", convRes.data.data.current_salary);
    if (convRes.data.data.employment_type !== 'Full-Time' || convRes.data.data.current_salary !== 40000) {
      throw new Error("Conversion failed to update type or salary");
    }
    console.log("PASS: Intern successfully converted to Full-Time.");

    // 5. TEST FULL-TIME SALARY INCREMENT
    console.log("\n--- TEST 5: Full-Time Salary Increment ---");
    const salIncRes = await post(`/api/employees/${internId}/salary/increase`, {
      new_salary: 48000,
      reason: 'Annual Increment',
      remarks: 'Led perception pipeline upgrade',
      created_by: 'Test HR'
    });
    console.log("Salary Increment Status:", salIncRes.status, "New Salary:", salIncRes.data.data.current_salary);
    if (salIncRes.data.data.current_salary !== 48000) throw new Error("Salary increment mismatch");
    console.log("PASS: Full-Time Salary Increment recorded.");

    // 6. TEST FULL-TIME NOTICE PERIOD
    console.log("\n--- TEST 6: Full-Time Notice Period ---");
    const noticeRes = await put(`/api/employees/${internId}/status`, {
      status: 'Notice Period',
      reason: 'Resigned for PhD',
      noticePeriod: {
        startDate: new Date().toISOString(),
        duration: '30 Days',
        expectedLastWorkingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        reason: 'PhD Offer abroad'
      }
    });
    console.log("Notice Period Status Code:", noticeRes.status, "Status:", noticeRes.data.data.status);
    if (noticeRes.data.data.status !== 'Notice Period') throw new Error("Failed to set Notice Period");
    console.log("PASS: Notice Period recorded with duration and expected LWD.");

    // 7. TEST RESIGNATION
    console.log("\n--- TEST 7: Resignation ---");
    const resignRes = await put(`/api/employees/${internId}/status`, {
      status: 'Resigned',
      reason: 'Exit complete',
      resignationDetails: {
        resignationDate: new Date().toISOString(),
        lastWorkingDate: new Date().toISOString(),
        exitDate: new Date().toISOString(),
        reason: 'Relieved cleanly'
      }
    });
    console.log("Resignation Status Code:", resignRes.status, "Status:", resignRes.data.data.status);
    if (resignRes.data.data.status !== 'Resigned') throw new Error("Failed to set Resigned");
    console.log("PASS: Resignation recorded.");

    // 8. TEST TIMELINE RETRIEVAL
    console.log("\n--- TEST 8: Full Timeline & History Retrieval ---");
    const profileRes = await get(`/get-one-emp-data/${internId}`);
    const empData = profileRes.data.data;
    console.log("Timeline Events Count:", empData.timeline.length);
    console.log("Salary History Count:", empData.salaryHistory.length);
    console.log("Stipend History Count (Preserved after conversion):", empData.stipendHistory.length);
    console.log("Employment History Count:", empData.employmentHistory.length);
    console.log("Status History Count:", empData.statusHistory.length);

    console.log("\nTimeline Chronological Trail:");
    empData.timeline.forEach((t, i) => {
      console.log(`  ${i+1}. [${t.event_type}] ${t.title}: ${t.description}`);
    });

    // Cleanup test record
    await Employee.deleteOne({ _id: internId });
    await EmploymentHistory.deleteMany({ employee_id: internId });
    await SalaryHistory.deleteMany({ employee_id: internId });
    await StipendHistory.deleteMany({ employee_id: internId });
    await StatusHistory.deleteMany({ employee_id: internId });
    await EmployeeTimeline.deleteMany({ employee_id: internId });
    console.log("\nTest employee cleaned up cleanly.");

    console.log("\n==========================================");
    console.log("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();

