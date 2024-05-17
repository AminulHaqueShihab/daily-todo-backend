import { Request, Response } from 'express';
import Joi from 'joi';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';

type BodyType = {
	email_phone: string;
	password: string;
};

type RequestType = Request & {
	body: BodyType;
};
const loginController = async (req: RequestType, res: Response) => {
  try{
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

	const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Wrong password',
    });
  }

  const token = user.generateAuthToken();
  return res.status(200).json({
    status: 'success',
    token: `Bearer ${token}`,
    message: 'User logged in successfully',
  });
  }catch(error: any){
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
	
};

const validate = (body: BodyType) => {
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
	return schema.validate(body);
};

export default loginController;
