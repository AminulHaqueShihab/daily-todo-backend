import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import Task from '../../models/task.model.js';

// Define the type for the request body
type BodyType = {
	title: string;
	description?: string;
	deadline?: Date;
	isCompleted?: boolean;
};
// Extend the Request type to include optional body and user properties
type RequestType = Request & {
	body?: BodyType;
	user?: mongoose.Document;
};

/**
 * Express controller for updating a task.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */

const updateTask = async (req: RequestType, res: Response) => {
	// Validate the request body
	const { error } = validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	try {
		// Destructure the request parameters and body
		const { id } = req.params;
		const userID = req?.user?._id;
		const { title, description, deadline, isCompleted } = req.body;

		// Find the task by ID
		const task = await Task.findById(id);
		// If the task is not found, return a 404 response
		if (!task) {
			return res.status(404).json({ message: 'Task not found' });
		}

		// If the user is not authorized to update the task, return a 403 response
		if (task.userID.toString() !== userID.toString()) {
			return res
				.status(403)
				.json({ message: 'You are not authorized to update this task' });
		}

		// Update the task
		task.title = title;
		task.description = description;
		task.deadline = deadline;
		task.isCompleted = isCompleted;

		// Save the task
		const saved = await task.save();
		if (!saved) {
			return res.status(500).json({ message: 'Task not saved' });
		}

		// Prepare the response data
		const resData = {
			_id: saved._id,
			title: saved.title,
			description: saved.description,
			deadline: saved.deadline,
			isCompleted: saved.isCompleted,
		};
		// Send the response
		return res
			.status(201)
			.json({ message: 'Task updated successfully', doc: resData });
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Validate the request body against a Joi schema.
 * @param {BodyType} data - The data to validate.
 * @returns {Joi.ValidationResult} - The result of the validation.
 */
const validate = (data: BodyType): Joi.ValidationResult => {
	// Define the validation schema
	const schema = Joi.object({
		title: Joi.string().required().messages({
			'string.empty': `Title cannot be an empty field`,
			'any.required': `Title is a required`,
		}),
		description: Joi.string().allow(''),
		deadline: Joi.date().allow('').messages({
			'date.base': `Deadline must be a date`,
		}),
	});
	// Validate the data against the schema
	return schema.validate(data);
};

export default updateTask;
