const ConfidentialDocument = require('../../models/confidential'); 
const Employee = require('../../models/employees'); 
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = 'public/new_uploads/'; 

const addConfidentialDocs = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        let confidentialDocEntry = await ConfidentialDocument.findOne({ employeeId });

        if (!confidentialDocEntry) {
            confidentialDocEntry = new ConfidentialDocument({
                employeeId,
                doc_name: 'Confidential Files', 
                confidentialDocs: []
            });
        }

        files.forEach(file => {
            confidentialDocEntry.confidentialDocs.push({
                fileName: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                uploadDate: new Date()
            });
        });

        await confidentialDocEntry.save();
        res.status(200).json({ message: 'Confidential file(s) uploaded successfully.' });

    } catch (error) {
        console.error('Error uploading confidential document:', error);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
};

const deleteConfidentialDocument = async (req, res) => {
    try {
        const { employeeId, fileName } = req.params;

        const confidentialDocEntry = await ConfidentialDocument.findOne({ employeeId });

        if (!confidentialDocEntry) {
            return res.status(404).json({ message: 'Confidential document entry not found for this employee.' });
        }

        const initialLength = confidentialDocEntry.confidentialDocs.length;
        confidentialDocEntry.confidentialDocs = confidentialDocEntry.confidentialDocs.filter(
            (doc) => doc.fileName !== fileName
        );

        if (confidentialDocEntry.confidentialDocs.length === initialLength) {
            return res.status(404).json({ message: 'File not found in confidential documents.' });
        }

        await confidentialDocEntry.save();

        // Also delete the file from the filesystem
        const filePath = path.join(UPLOAD_DIR, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({ message: 'Confidential file deleted successfully.' });

    } catch (error) {
        console.error('Error deleting confidential document:', error);
        res.status(500).json({ error: 'Internal server error during delete.' });
    }
};

const getConfidentialDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const confidentialDocEntry = await ConfidentialDocument.findOne({ employeeId });

        if (!confidentialDocEntry) {
            return res.status(200).json({ confidentialDocs: [] }); 
        }

        res.status(200).json({ confidentialDocs: confidentialDocEntry.confidentialDocs });

    } catch (error) {
        console.error('Error fetching confidential documents:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    addConfidentialDocs,
    deleteConfidentialDocument,
    getConfidentialDocuments
};