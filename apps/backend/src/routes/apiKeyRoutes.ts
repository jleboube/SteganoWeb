import { Router } from 'express';
import {
  createApiKeyHandler,
  listApiKeysHandler,
  revokeApiKeyHandler
} from '../controllers/apiKeyController.js';

const router = Router();

router.get('/', listApiKeysHandler);
router.post('/', createApiKeyHandler);
router.delete('/:id', revokeApiKeyHandler);

export default router;
