import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../../models/task.model.js';

// Extend the Request type to include an optional user property
type RequestType = Request & {
	user?: mongoose.Document;
};
/**
 * Express controller for getting all tasks of a user.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */
const getAllTaskofUser = async (req: RequestType, res: Response) => {
	try {
		// Get the user ID from the request object
		const userID = req?.user?._id;

		// Find all tasks associated with the user ID
		const tasks = await Task.find({ userID });

		// If no tasks are found, return a 404 response
		if (!tasks) {
			return res.status(404).json({ message: 'No task found' });
		}

		// If tasks are found, return them in the response
		return res.status(200).json({ message: 'Tasks found', tasks });
	} catch (error: any) {
		console.log(error.message);
		return res.status(500).json({ message: error.message });
	}
};

export default getAllTaskofUser;
