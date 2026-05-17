import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import * as chatController from '../../controllers/chat.controller';

const router = Router();
router.use(protect);

// Express interest in a task → creates chat
router.post('/interest/:taskId', chatController.expressInterest);

// List all my chats
router.get('/', chatController.listMyChats);

// Get single chat + messages
router.get('/:chatId', chatController.getChatById);

// Send a message
router.post('/:chatId/messages', chatController.sendMessage);

// Set agreed price
router.patch('/:chatId/price', chatController.setAgreedPrice);

export default router;
