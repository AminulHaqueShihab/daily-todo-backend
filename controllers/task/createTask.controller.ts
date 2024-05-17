import { Request, Response } from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import Task from '../../models/task.model.js';

/**
 * Express controller for creating a task.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */

// Define the type for the request body
type BodyType = {
	title: string;
	description?: string;
	deadline?: Date;
};

// Extend the Request type to include optional body and user properties
type RequestType = Request & {
	body?: BodyType;
	user?: mongoose.Document;
};


const createTask = async (req: RequestType, res: Response) => {
	// Validate the request body
	const { error } = validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	try {
		const { title, description, deadline } = req.body;
		// Get the user ID from the request object
		const userID = req?.user?._id;

		const task = new Task({
			title,
			description,
			deadline,
			userID,
		});
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
			.json({ message: 'Task created successfully', doc: resData });
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
	const schema = Joi.object({
		title: Joi.string().required().messages({
			'string.empty': `Title cannot be an empty field`,
			'any.required': `Title is a required`,
		}),
		description: Joi.string(),
		deadline: Joi.date().messages({
			'date.base': `Deadline must be a date`,
		}),
	});
	return schema.validate(data);
};

export default createTask;
