const mongoose = require('mongoose');
const { Schema } = mongoose;
const AccessControlSchema = require('./AccessControlSchema');

const employeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyEmail: { type: String, unique: true },

  contact: { type: String, required: false },
  address: { type: String, required: false },
  permanentAddress: { type: String },

  company: { type: String, required: true },
  category: { type: String, required:true },
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
    branchNumber: { type: String }
  },

  salary: { type: Number },
  ctc: { type: String },
  stipend: { type: Number },

  status: {
    type: String,
    required: true
  },
  documents: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },

  accessControl: [AccessControlSchema]
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);