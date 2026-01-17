const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/medical-files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created hospital files upload directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hospital-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    }
  }
});

// All hospital routes require hospital login
router.get('/dashboard', authMiddleware, roleMiddleware('hospital'), hospitalController.getHospitalDashboard);
router.get('/patients', authMiddleware, roleMiddleware('hospital'), hospitalController.getActivePatients);
router.get('/patient/:medical_id', authMiddleware, roleMiddleware('hospital'), hospitalController.getPatientDetails);

// Patient query and document access
router.post('/query-patient', authMiddleware, roleMiddleware('hospital'), hospitalController.queryPatient);
router.get('/patient-docs/:patient_id', authMiddleware, roleMiddleware('hospital'), hospitalController.getPatientDocs);

// Hospital upload medical documents for patients
router.post('/upload-doc/:patient_id', authMiddleware, roleMiddleware('hospital'), upload.single('file'), hospitalController.uploadDocument);

// Get hospital's uploaded documents
router.get('/uploaded-records', authMiddleware, roleMiddleware('hospital'), hospitalController.getHospitalUploads);

// Legacy routes (keep for backward compatibility)
router.post('/records/upload', authMiddleware, roleMiddleware('hospital'), hospitalController.uploadMedicalRecord);
router.post('/bills/create', authMiddleware, roleMiddleware('hospital'), hospitalController.createMedicalBill);

module.exports = router;
