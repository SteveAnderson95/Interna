const fs = require("fs");
const multer = require("multer");
const path = require("path");

const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

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

const createFileFilter = (allowedExtensions) => (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    cb(new Error("Invalid file type"));
    return;
  }

  cb(null, true);
};

const createUploader = (folder, allowedExtensions = DOCUMENT_EXTENSIONS) =>
  multer({
    storage: createStorage(folder),
    fileFilter: createFileFilter(allowedExtensions),
  });

module.exports = {
  createUploader,
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
};
