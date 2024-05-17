import express from 'express';
import createTask from '../controllers/task/createTask.controller.js';
import { protect } from '../middlewares/auth/auth.middleware.js';
import getAllTaskofUser from '../controllers/task/getAllTaskofUser.controller.js';
import updateTask from '../controllers/task/updateTask.controller.js';
import deleteTask from '../controllers/task/deleteTask.controller.js';
import updateStatus from '../controllers/task/updateStatus.controller.js';
import getTaskById from '../controllers/task/getTaskById.controller.js';

const router = express.Router();

router.get('/', protect, getAllTaskofUser);
router.post('/', protect, createTask);
router.get('/:id', protect, getTaskById);
router.put('/update/:id', protect, updateTask);
router.put('/update/status/:id', protect, updateStatus);
router.delete('/delete/:id', protect, deleteTask);

export default router;
