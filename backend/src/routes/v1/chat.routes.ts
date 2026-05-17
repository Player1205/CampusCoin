import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { sendMessageSchema, setAgreedPriceSchema } from '../../validations/chat.schema';
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
router.post('/:chatId/messages', validate(sendMessageSchema), chatController.sendMessage);

// Set agreed price
router.patch('/:chatId/price', validate(setAgreedPriceSchema), chatController.setAgreedPrice);

export default router;
