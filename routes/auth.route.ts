import express from 'express';
import registerController from '../controllers/auth/register.controller.js';
import loginController from '../controllers/auth/login.controller.js';
import { protect } from '../middlewares/auth/auth.middleware.js';
import updateSelfController from '../controllers/auth/updateSelf.controller.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.put('/updateSelf', protect, updateSelfController);

export default router;
