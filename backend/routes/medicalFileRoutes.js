const express = require('express');
const router = express.Router();
const medicalFileController = require('../controllers/medicalFileController');
const { authMedical } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/medical-files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created medical files upload directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'medical-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
  }
});

// ==================== FOLDER ROUTES ====================
router.get('/folders', authMedical, medicalFileController.getFolders);
router.post('/folders', authMedical, medicalFileController.createFolder);
router.put('/folders/:folderId', authMedical, medicalFileController.renameFolder);
router.delete('/folders/:folderId', authMedical, medicalFileController.deleteFolder);

// ==================== FILE ROUTES ====================
router.get('/files', authMedical, medicalFileController.getFiles);
router.post('/files', authMedical, upload.single('file'), medicalFileController.uploadFile);
router.get('/files/:fileId/download', authMedical, medicalFileController.downloadFile);
router.delete('/files/:fileId', authMedical, medicalFileController.deleteFile);

module.exports = router;
