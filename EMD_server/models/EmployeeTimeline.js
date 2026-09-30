const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeTimelineSchema = new Schema({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  event_type: {
    type: String,
    enum: [
      'EMPLOYEE_JOINED',
      'EMPLOYMENT_TYPE_CHANGED',
      'INTERN_CONVERTED_TO_FULL_TIME',
      'SALARY_INCREASED',
      'STIPEND_INCREASED',
      'STATUS_CHANGED',
      'NOTICE_PERIOD_STARTED',
      'RESIGNED',
      'LEFT',
      'INTERNSHIP_COMPLETED',
      'CONTRACT_STARTED',
      'CONTRACT_ENDED'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  event_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  created_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeTimeline', employeeTimelineSchema);

