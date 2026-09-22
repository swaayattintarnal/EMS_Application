const Document = require("../../models/documents");
const fs = require("fs");
const path = require("path");

const deleteEmployeeDocument = async (req, res) => {
  const { employeeId, category, fileName } = req.params;
  console.log("➡️ Delete requested for:", { employeeId, category, fileName });

  try {
    const doc = await Document.findOne({ employeeId });
    if (!doc) {
      console.log("❌ Document not found for employeeId:", employeeId);
      return res.status(404).json({ error: "Document record not found" });
    }

    const docCategory = getDocCategoryField(doc, category);
    if (!docCategory) {
      console.log("❌ Invalid document category:", category);
      return res.status(400).json({ error: "Invalid document category" });
    }

    let fileFound = false;

    for (const key of Object.keys(docCategory)) {
      const files = docCategory[key];
      console.log(
        `🔍 Looking in ${category}.${key}:`,
        files.map((f) => f.fileName)
      );

      const index = files.findIndex((f) => f.fileName === fileName);
      if (index !== -1) {
        console.log(`✅ File found in ${category}.${key}`);
        files.splice(index, 1);
        fileFound = true;
        break;
      }
    }

    // console.log("🧩 Checking files under:", Object.keys(docCategory));


    if (!fileFound) {
      console.log("❌ File not found in any subcategory of:", category);
      return res.status(404).json({ error: "File not found" });
    }

    sanitizeBrokenFiles(doc.legalDocs);
    sanitizeBrokenFiles(doc.professionalDocs);
    sanitizeBrokenFiles(doc.personalDocs);
    function sanitizeBrokenFiles(categoryGroup) {
      for (const key of Object.keys(categoryGroup)) {
        categoryGroup[key] = categoryGroup[key].filter(
          (file) => file.fileName && file.originalName && file.mimeType
        );
      }
    }

    await doc.save();

    const filePath = path.join(__dirname, "..", "new_uploads", fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted from server:", filePath);
    } else {
      console.log("File not found on server:", filePath);
    }

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

function getDocCategoryField(doc, category) {
  switch (category) {
    case "legal":
      return doc.legalDocs;
    case "professional":
      return doc.professionalDocs;
    case "personal":
      return doc.personalDocs;
    default:
      return null;
  }
}

module.exports = { deleteEmployeeDocument };
