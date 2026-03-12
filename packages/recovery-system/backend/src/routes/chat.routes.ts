import {Router} from 'express';
import {isAuth} from '../middleware/isAuth';
import {chatController} from '../controllers/chat.controller';

const router = Router();

router.use(isAuth); // Ensure all chat routes require authentication

router.post("/message", chatController.sendMessage);

router.get("/history", chatController.getChatHistory);

export default router;

