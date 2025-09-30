import { Router } from 'express';
import multer from 'multer';
import { encodeHandler, decodeHandler } from '../controllers/stegController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const uploadEncode = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(new Error('Only JPEG and PNG images are allowed'));
      return;
    }
    callback(null, true);
  }
});

const uploadDecode = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(new Error('Only JPEG and PNG images are allowed'));
      return;
    }
    callback(null, true);
  }
});

const router = Router();

router.post('/encode', requireAuth, uploadEncode.single('image'), encodeHandler);
router.post('/decode', requireAuth, uploadDecode.single('image'), decodeHandler);

export default router;
