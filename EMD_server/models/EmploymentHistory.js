const mongoose = require('mongoose');
const { Schema } = mongoose;

const employmentHistorySchema = new Schema({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employment_type: {
    type: String,
    enum: ['Intern', 'Full-Time', 'Contract'],
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    default: null
  },
  reason: {
    type: String
  },
  remarks: {
    type: String
  },
  created_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('EmploymentHistory', employmentHistorySchema);

