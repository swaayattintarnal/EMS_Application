const mongoose = require('mongoose');
const { Schema } = mongoose;
const AccessControlSchema = require('./AccessControlSchema');

const employeeSchema = new Schema({
  employee_id: { type: String },
  department: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyEmail: { type: String, unique: true },

  contact: { type: String, required: false },
  address: { type: String, required: false },
  permanentAddress: { type: String },

  company: { type: String, required: true },
  category: { type: String, required: true },
  employment_type: { 
    type: String, 
    enum: ['Intern', 'Full-Time', 'Contract'],
    default: 'Full-Time'
  },
  profilePhoto: {
    type: String,
    default: null
  },

  dateOfBirth: { type: Date },
  birthPlace: { type: String },
  nationality: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  bloodGroup: { type: String },
  panNumber: { type: String },
  aadharNumber: { type: String },

  education: {
    tenth: {
      board: { type: String },
      school: { type: String },
      year: { type: Number },
      percentage: { type: Number }
    },
    twelfth: {
      board: { type: String },
      school: { type: String },
      year: { type: Number },
      percentage: { type: Number }
    },
    graduation: {
      college: { type: String },
      year: { type: Number },
      cgpa: { type: Number }
    },
    postGraduation: {
      college: { type: String },
      year: { type: Number },
      cgpa: { type: Number }
    }
  },

  designation: { type: String },
  dateOfJoining: { type: Date },
  dateOfLeaving:{type: Date},

  emergencyContact: {
    name: { type: String },
    number: { type: String }
  },

  bankDetails: {
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branchName: { type: String },
    branchNumber: { type: String }
  },

  salary: { type: Number },
  current_salary: { type: Number },
  ctc: { type: String },
  stipend: { type: Number },
  current_stipend: { type: Number },

  status: {
    type: String,
    required: true
  },
  last_working_date: { type: Date },

  noticePeriod: {
    startDate: { type: Date },
    duration: { type: String },
    expectedLastWorkingDate: { type: Date },
    actualLastWorkingDate: { type: Date },
    reason: { type: String },
    remarks: { type: String }
  },

  resignationDetails: {
    resignationDate: { type: Date },
    noticePeriodStartDate: { type: Date },
    lastWorkingDate: { type: Date },
    exitDate: { type: Date },
    reason: { type: String },
    remarks: { type: String }
  },

  contractDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    payment: { type: Number },
    remarks: { type: String }
  },
  documents: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },

  accessControl: [AccessControlSchema]
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);