import { Router } from 'express';
import { encodePublicHandler, decodePublicHandler } from '../controllers/publicStegController.js';

const router = Router();

router.post('/encode', encodePublicHandler);
router.post('/decode', decodePublicHandler);

export default router;
