import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment,
  downloadPDF,
} from '../controllers/assignment.controller';
import multer from 'multer';

const router = Router();

// Multer setup — keep files in memory as Buffer (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed.'));
    }
  },
});

// GET  /api/assignments        — list all assignments
router.get('/', asyncHandler(getAssignments));

// POST /api/assignments        — create assignment (JSON or multipart with file)
router.post('/', upload.single('file'), asyncHandler(createAssignment));

// GET  /api/assignments/:id    — get single assignment
router.get('/:id', asyncHandler(getAssignment));

// DELETE /api/assignments/:id  — delete assignment
router.delete('/:id', asyncHandler(deleteAssignment));

// POST /api/assignments/:id/regenerate — regenerate paper for existing assignment
router.post('/:id/regenerate', asyncHandler(regenerateAssignment));

// GET  /api/assignments/:id/pdf — download generated paper as PDF
router.get('/:id/pdf', asyncHandler(downloadPDF));

export default router;