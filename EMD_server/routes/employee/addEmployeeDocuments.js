const mongoose = require('mongoose');
const Document = require('../../models/documents');
const Employee = require('../../models/employees');

function mapFileToSchema(file) {
  if (!file) return null;
  return {
    fileName: file.filename,
    originalName: file.originalname, 
    mimeType: file.mimetype,         
    uploadDate: new Date()           
  };
}

exports.addDocument = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const trimmedId = (employeeId || '').trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const legalDocs = {};
    const professionalDocs = {};
    const personalDocs = {};

    let profilePhotoUrl = null;

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const mappedFile = mapFileToSchema(file);
        if (!mappedFile) return; 

        const field = file.fieldname; 

         if (['epra', 'ea', 'nda', 'offerLetter', 'trl', 'form16'].includes(field)) {
          if (!legalDocs[field]) legalDocs[field] = [];
          legalDocs[field].push(mappedFile);
        } else if (['resume', 'certificates', 'experienceLetters'].includes(field)) {
          if (!professionalDocs[field]) professionalDocs[field] = [];
          professionalDocs[field].push(mappedFile);
        } else if (['panCard', 'aadharCard', 'academicMarksheets', 'passportSizePhotos'].includes(field)) {
          if (!personalDocs[field]) personalDocs[field] = [];
          personalDocs[field].push(mappedFile);

          if (field === 'passportSizePhotos') {
            profilePhotoUrl = mappedFile.fileName; 
          }
        }
      });
    }

    let existingDocument = await Document.findOne({ employeeId: trimmedId });
    let newDocument = null;

    if (existingDocument) {
      // Merge new documents into existing ones
      const mergeDocuments = (existingGroup, newGroup) => {
        for (const key in newGroup) {
          if (newGroup.hasOwnProperty(key)) {
            if (!existingGroup[key]) {
              existingGroup[key] = [];
            }
            // Append new files to the existing array for that category
            existingGroup[key].push(...newGroup[key]);
          }
        }
      };

      mergeDocuments(existingDocument.legalDocs, legalDocs);
      mergeDocuments(existingDocument.professionalDocs, professionalDocs);
      mergeDocuments(existingDocument.personalDocs, personalDocs);

      await existingDocument.save();
    } else {
      // Create a new document record
      newDocument = new Document({
        employeeId: new mongoose.Types.ObjectId(trimmedId), 
        legalDocs: legalDocs,
        professionalDocs: professionalDocs,
        personalDocs: personalDocs
      });
      await newDocument.save();
    }

    // Update the employee's profilePhoto field
    if (profilePhotoUrl) {
      await Employee.findByIdAndUpdate(
        trimmedId,
        { profilePhoto: profilePhotoUrl },
        { new: true } 
      );
    }

    res.status(200).json({
      success: true,
      message: existingDocument ? 'Documents updated successfully' : 'Documents uploaded successfully',
      data: existingDocument || newDocument 
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};