import { Request, Response } from 'express';
import Joi from 'joi';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';

type BodyType = {
	name: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
};

type RequestType = Request & {
	body: BodyType;
};
const registerController = async (req: RequestType, res: Response) => {
	const { error } = validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	if (req.body.password !== req.body.confirmPassword) {
		return res.status(400).json({
			message: 'Password and Confirm Password must be same',
		});
	}

	try {
		const { name, email, phone, password } = req.body;
		let user = await User.findOne({
			$or: [{ email: email }, { phone: phone }],
		});
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
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		const saved = await user.save();
		const token = user.generateAuthToken();
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

const validate = (data: BodyType): Joi.ValidationResult => {
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
	return schema.validate(data);
};

export default registerController;
