const fs = require('fs');
const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = 'public/new_uploads/';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const multiUpload = upload.any([
  // Legal
  { name: 'epra', maxCount: 5 },
  { name: 'ea', maxCount: 5 },
  { name: 'nda', maxCount: 5 },
  { name: 'offerLetter', maxCount: 5 },
   { name: 'trl', maxCount: 5 }, 
  { name: 'form16', maxCount: 5 },
  
  // Professional
  { name: 'resume', maxCount: 5 },
  { name: 'certificates', maxCount: 5 },
  { name: 'experienceLetters', maxCount: 5 },

  // Personal
  { name: 'panCard', maxCount: 5 },
  { name: 'aadharCard', maxCount: 5 },
  { name: 'academicMarksheets', maxCount: 5 },
  { name: 'passportSizePhotos', maxCount: 5 },

   // Confidential Files
  { name: 'confidentialFiles', maxCount: 50 },
]);

module.exports = multiUpload;