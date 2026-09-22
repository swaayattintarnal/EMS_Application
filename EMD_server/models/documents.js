const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileName: {       
        type: String,
        required: true,
    },
    originalName: {   
        type: String,
        required: true, 
    },
    mimeType: {       
        type: String,
        required: true, 
    },

    uploadDate: {     
        type: Date,
        default: Date.now,
    }
});

const documentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },

    legalDocs: {
        epra: [fileSchema],
        ea: [fileSchema],
        nda: [fileSchema],
        offerLetter: [fileSchema],
        resignationLetter: [fileSchema],
        trl: [fileSchema], 
        form16: [fileSchema],
    },

    professionalDocs: {
        resume: [fileSchema],
        certificates: [fileSchema],
        experienceLetters: [fileSchema]
    },

    personalDocs: {
        panCard: [fileSchema],
        aadharCard: [fileSchema],
        academicMarksheets: [fileSchema],
        passportSizePhotos: [fileSchema]
    }

}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);