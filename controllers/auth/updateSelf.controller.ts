import { Request, Response } from 'express';
import Joi from 'joi';
import User from '../../models/user.model.js';

type BodyType = {
	name: string;
	phone: string;
};

type RequestType = Request & {
	body: BodyType;
	user?: any;
};

const updateSelfController = async (
	req: RequestType,
	res: Response
): Promise<Response> => {
	const { error } = validate(req.body);
	if (error) return res.status(400).json({ message: error.details[0].message });
	try {
		const { id } = req.user;
		const { name, phone } = req.body;

		const user = await User.findById(id);

		if (!user) return res.status(404).json({ message: 'User not found' });

		name && (user.name = name);
		phone && (user.phone = phone);

		const saved = await user.save();

		return res
			.status(200)
			.json({ status: 'success', message: 'User updated successfully' });
	} catch (error: any) {
		return res.status(500).json({ status: 'error', message: error.message });
	}
};

const validate = (body: BodyType): Joi.ValidationResult => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(255).messages({
			'string.min': 'Name must be at least 3 characters long',
			'string.max': 'Name must be at most 255 characters long',
		}),
		phone: Joi.string()
			.pattern(/^(01\d{9})$/)
			.messages({
				'string.pattern.base': 'Please fill a valid phone number',
			}),
	});
	return schema.validate(body);
};

export default updateSelfController;
