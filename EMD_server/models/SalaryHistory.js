const mongoose = require('mongoose');
const { Schema } = mongoose;

const salaryHistorySchema = new Schema({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  previous_salary: {
    type: Number,
    required: true,
    default: 0
  },
  new_salary: {
    type: Number,
    required: true
  },
  increment_amount: {
    type: Number,
    default: 0
  },
  increment_percentage: {
    type: Number,
    default: 0
  },
  effective_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    default: 'Salary Revision'
  },
  remarks: {
    type: String
  },
  created_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('SalaryHistory', salaryHistorySchema);

