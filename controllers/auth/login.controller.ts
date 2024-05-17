import { Request, Response } from 'express';
import Joi from 'joi';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';

// Define the type for the request body
type BodyType = {
	email_phone: string;
	password: string;
};

// Extend the Request type to include the body property
type RequestType = Request & {
	body: BodyType;
};

/**
 * Express controller for logging in a user.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */

const loginController = async (req: RequestType, res: Response) => {
	try {
		// Validate the request body
		const { error } = validate(req.body);
		if (error) {
			return res.status(400).json({
				message: error.details[0].message,
			});
		}

		let user;
		if (req.body.email_phone.includes('@' || '.')) {
			// login with email
			user = await User.findOne({ email: req.body.email_phone });
		} else {
			// login with phone
			user = await User.findOne({ phone: req.body.email_phone });
		}

		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'Email or phone not found',
			});
		}

		// Compare the provided password with the stored password
		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validPassword) {
			return res.status(400).json({
				status: 'error',
				message: 'Wrong password',
			});
		}

		// Generate the auth token
		const token = user.generateAuthToken();
		// Send the response
		return res.status(200).json({
			status: 'success',
			token: `Bearer ${token}`,
			message: 'User logged in successfully',
		});
	} catch (error: any) {
		return res.status(500).json({
			status: 'error',
			message: error.message,
		});
	}
};

/**
 * Validate the request body against a Joi schema.
 * @param {BodyType} body - The data to validate.
 * @returns {Joi.ValidationResult} - The result of the validation.
 */

const validate = (body: BodyType) => {
	// Define the validation schema
	const schema = Joi.object({
		email_phone: Joi.string().required().messages({
			'string.email': 'Please enter a valid email address',
			'string.empty': 'Email cannot be empty',
			'any.required': 'Email is required',
		}),
		password: Joi.string().required().messages({
			'string.empty': 'Password cannot be empty',
			'any.required': 'Password is required',
		}),
	});
	// Validate the data
	return schema.validate(body);
};

export default loginController;
