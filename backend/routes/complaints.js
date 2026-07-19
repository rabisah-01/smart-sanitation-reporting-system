const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createComplaint, getComplaints, getComplaintById, updateStatus, assignComplaint, deleteComplaint
} = require('../controllers/complaintController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.get('/', protect, getComplaints);
router.post('/', protect, upload.single('image'), createComplaint);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, adminOnly, updateStatus);
router.post('/:id/assign', protect, adminOnly, assignComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
