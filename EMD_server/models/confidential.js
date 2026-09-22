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

const confidentialdocumentSchema = new mongoose.Schema({
    
    doc_name: {
        type:String,
        required: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },
   confidentialDocs: [fileSchema]

}, { timestamps: true });

module.exports = mongoose.model('confidentialdocument', confidentialdocumentSchema);