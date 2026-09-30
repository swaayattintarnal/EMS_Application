const mongoose = require('mongoose');
const { Schema } = mongoose;

const stipendHistorySchema = new Schema({
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  previous_stipend: {
    type: Number,
    required: true,
    default: 0
  },
  new_stipend: {
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
    default: 'Stipend Revision'
  },
  remarks: {
    type: String
  },
  created_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('StipendHistory', stipendHistorySchema);

