import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../../models/task.model.js';

// Extend the Request type to include an optional user property
type RequestType = Request & {
	user?: mongoose.Document;
};

/**
 * Express controller for getting a task by its ID.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */

const getTaskById = async (req: RequestType, res: Response) => {
	try {
		// Destructure the request parameters
		const { id } = req.params;
		const userID = req?.user?._id;

		// Find the task by ID
		const task = await Task.findById(id);

		// If the task is not found, return a 404 response
		if (!task) {
			return res.status(404).json({ message: 'Task not found' });
		}

		// If the user is not authorized to see the task, return a 403 response
		if (task.userID.toString() !== userID.toString()) {
			return res
				.status(403)
				.json({ message: 'You are not authorized to see this task' });
		}

		// Prepare the response data
		const resData = {
			_id: task._id,
			title: task.title,
			description: task.description,
			deadline: task.deadline,
			isCompleted: task.isCompleted,
		};
		// Send the response
		return res.status(200).json({ message: 'Task found', doc: resData });
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
};

export default getTaskById;
