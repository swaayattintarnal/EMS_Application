const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccessControlSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    adminLevel: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]
    },

    // --- Viewing Permissions ---
    canViewOverview: { type: Boolean, default: true },
    // canViewEmploymentDetails: { type: Boolean, default: true },
    // canViewHealthInformation: { type: Boolean, default: true },
    // canViewEducation: { type: Boolean, default: true },
    // canViewEmergencyContact: { type: Boolean, default: true },
    canViewBankDetails: { type: Boolean, default: false },

    // --- Document Viewing Permissions ---
    canViewProfessionalDocuments: { type: Boolean, default: false },
    canViewPersonalDocuments: { type: Boolean, default: false },
    canViewLegalDocuments: { type: Boolean, default: false },
    canViewConfidentialDocuments: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = AccessControlSchema; 