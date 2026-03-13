const fs = require("fs");
const multer = require("multer");
const path = require("path");

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const ensureDirectory = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", folder);
      ensureDirectory(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const safeBaseName = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${safeBaseName}${extension}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    cb(new Error("Only PDF, DOC and DOCX files are allowed"));
    return;
  }

  cb(null, true);
};

const createUploader = (folder) =>
  multer({
    storage: createStorage(folder),
    fileFilter,
  });

module.exports = {
  createUploader,
};
