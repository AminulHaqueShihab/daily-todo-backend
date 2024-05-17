import { Request, Response } from 'express';
import Joi from 'joi';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';

// Define the type for the request body
type BodyType = {
	name: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
};

// Extend the Request type to include the body property
type RequestType = Request & {
	body: BodyType;
};

/**
 * Express controller for registering a new user.
 * @author Md Aminul Haque
 * @param {RequestType} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} - The response object.
 */

const registerController = async (req: RequestType, res: Response) => {
	// Validate the request body
	const { error } = validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}

	// Check if the password and confirm password are the same
	if (req.body.password !== req.body.confirmPassword) {
		return res.status(400).json({
			message: 'Password and Confirm Password must be same',
		});
	}

	try {
		// Destructure the request body
		const { name, email, phone, password } = req.body;
		// Check if the user is already registered
		let user = await User.findOne({
			$or: [{ email: email }, { phone: phone }],
		});

		// Create a new user
		if (user) {
			return res.status(400).json({
				message: 'User already registered with this email or phone number',
			});
		}
		user = new User({
			name,
			email,
			phone,
			password,
		});

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);

		// Save the user
		const saved = await user.save();

		// Generate the auth token
		const token = user.generateAuthToken();

		// Send the response
		return res
			.status(201)
			.header('x-auth-token')
			.json({
				token: `Bearer ${token}`,
				message: 'User registered successfully',
			});
	} catch (error: any) {
		return res.status(500).json({
			message: error.message,
		});
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
		name: Joi.string().required().min(3).max(50).messages({
			'string.empty': 'Name should not be empty',
			'string.min': 'Name should have a minimum length of {#limit}',
			'string.max': 'Name should have a maximum length of {#limit}',
			'any.required': 'Name is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Email should be a valid email',
			'string.empty': 'Email should not be empty',
			'any.required': 'Email is required',
		}),
		phone: Joi.string()
			.pattern(/^(01\d{9})$/)
			.messages({
				'string.pattern.base': 'Phone number should be a valid phone number',
			}),
		password: Joi.string().required().min(8).max(50).messages({
			'string.empty': 'Password should not be empty',
			'string.min': 'Password should have a minimum length of {#limit}',
			'string.max': 'Password should have a maximum length of {#limit}',
			'any.required': 'Password is required',
		}),
		confirmPassword: Joi.string().required().min(8).max(50).messages({
			'string.empty': 'Confirm Password should not be empty',
			'any.required': 'Confirm Password is required',
		}),
	});
	// Validate the data
	return schema.validate(data);
};

export default registerController;
