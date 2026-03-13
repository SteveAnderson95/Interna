const path = require("path");

const uploadFile = (folder) => (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      filePath: path.posix.join("uploads", folder, req.file.filename),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  uploadCvFile: uploadFile("cvs"),
  uploadMotivationLetterFile: uploadFile("motivation_letters"),
  uploadConventionFile: uploadFile("conventions"),
  uploadReportFile: uploadFile("reports"),
};
