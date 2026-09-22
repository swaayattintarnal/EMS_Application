const Employee = require("../../models/employees");
const Document = require("../../models/documents");

const getEmployeeDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).lean(); 
    

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const employeeDocuments = await Document.findOne({ employeeId: id }).lean();

    const allDocFields = {
      legalDocs: [
        { name: 'epra', displayName: 'EPRA' },
        { name: 'ea', displayName: 'EA (Employment Agreement)' },
        { name: 'nda', displayName: 'NDA (Non-Disclosure Agreement)' },
        { name: 'offerLetter', displayName: 'Offer Letter' },
        { name: 'trl', displayName: 'TRL (Termination/Resignation Letter)' },
        { name: 'form16', displayName: 'Form 16' }, 
      ],
      professionalDocs: [
        { name: 'resume', displayName: 'Resume / CV' },
        { name: 'certificates', displayName: 'Certification' }, 
        { name: 'experienceLetters', displayName: 'Experience Letter' },
      ],
      personalDocs: [
        { name: 'panCard', displayName: 'PAN Card' },
        { name: 'aadharCard', displayName: 'Aadhaar Card' },
        { name: 'academicMarksheets', displayName: 'Academic Marksheets' },
        { name: 'passportSizePhotos', displayName: 'Passport Photo' }, 
      ]
    };

    const organizedDocuments = {
      legal: [],
      professional: [],
      personal: [],
    };

    Object.keys(allDocFields).forEach(docCategoryKey => { 
      allDocFields[docCategoryKey].forEach(docType => { 
        const actualFiles = employeeDocuments?.[docCategoryKey]?.[docType.name] || []; 
        
        organizedDocuments[docCategoryKey.replace('Docs', '')].push({ 
          name: docType.name, 
          displayName: docType.displayName, 
          status: actualFiles.length > 0 ? 'uploaded' : 'not-uploaded',
          files: actualFiles.map(file => file.fileName), 
        });
      });
    });

    const employeeWithDocuments = {
      ...employee,
      documents: organizedDocuments,
    };

    // console.log("details",employeeWithDocuments)
    res.status(200).json({
      success: true,
      message: "Employee details fetched successfully",
      data: employeeWithDocuments,
    });

  } catch (error) {
    console.error("Error while fetching employee details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee details",
      error: error.message,
    });
  }
};

module.exports = { getEmployeeDetailsById };

