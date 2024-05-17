import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';

type IUser = {
	_id: string;
	name: string;
	email: string;
};

type IRequest = Request & {
	user?: any;
};

export function authfunction(req: IRequest, res: Response, next: NextFunction) {
	const token = req.header('x-auth-token');
	if (!token) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied. No token available',
		});
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_PRIVATE_KEY || 'fallback_key_01771615835'
		);
		req.user = decoded;
		next();
	} catch (error: any) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid token',
		});
	}
}

export const protect = async (
	req: IRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	let token: string | undefined;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(
				token,
				process.env.JWT_PRIVATE_KEY || 'fallback_key_01771615835'
			) as IUser;
			req.user = await User.findById(decoded?._id).select('-password');
			next();
		} catch (error: any) {
			return res.status(401).json({
				status: 'error',
				message: 'Not authorized, token failed',
			});
		}
	}

	if (!token) {
		return res.status(401).json({
			status: 'error',
			message: 'Not authorized, no token',
		});
	}
};
