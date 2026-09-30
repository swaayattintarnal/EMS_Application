const mongoose = require('mongoose');
const { Schema } = mongoose;

const statusHistorySchema = new Schema({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  previous_status: {
    type: String,
    required: true
  },
  new_status: {
    type: String,
    required: true
  },
  effective_date: {
    type: Date,
    required: true,
    default: Date.now
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

module.exports = mongoose.model('StatusHistory', statusHistorySchema);

