import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { chat } from '../controllers/chat.controller';

const router = Router();

// POST /api/chat — AI Teacher's Toolkit streaming chat
router.post('/', asyncHandler(chat));

export default router;
