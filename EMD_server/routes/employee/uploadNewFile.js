const Document = require('../../models/documents');


const uploadDocument = async (req, res) => {
  try {
    // console.log("📥 Incoming Upload Request");
    // console.log("🧾 Fields:", req.body);
    // console.log("📎 Files:", req.files);

    const { employeeId, category, docName } = req.body;
    const files = req.files;

    if (!employeeId || !category || !docName || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or files' });
    }

    const doc = await Document.findOne({ employeeId });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const targetGroup =
      category === 'legal' ? doc.legalDocs :
      category === 'professional' ? doc.professionalDocs :
      category === 'personal' ? doc.personalDocs :
      null;

    if (!targetGroup || !targetGroup[docName]) {
      return res.status(400).json({ error: 'Invalid docName or category' });
    }

    files.forEach((file) => {
      targetGroup[docName].push({
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype
      });
    });

    await doc.save();
    res.status(200).json({ message: 'File(s) uploaded successfully' });
  } catch (err) {
    console.error("🔥 Upload error:", err);
    res.status(500).json({ error: 'Server error during upload' });
  }
};

module.exports = { uploadDocument };

