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

/**
 * Middleware function for authenticating a user.
 * @author Md Aminul Haque
 * @param {IRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Response | void} - The response object or void.
 */

export function authfunction(req: IRequest, res: Response, next: NextFunction) {
	// Get the token from the request header
	const token = req.header('x-auth-token');
	// If the token is not available, return a 401 response
	if (!token) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied. No token available',
		});
	}

	try {
		// Verify the token
		const decoded = jwt.verify(
			token,
			process.env.JWT_PRIVATE_KEY || 'fallback_key_01771615835'
		);

		// Set the user property on the request object
		req.user = decoded;
		// Call the next middleware function
		next();
	} catch (error: any) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid token',
		});
	}
}

/**
 * Middleware function for protecting routes.
 * @author Md Aminul Haque
 * @param {IRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response | void>} - The response object or void.
 */

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
			// Get the token from the authorization header
			token = req.headers.authorization.split(' ')[1];
			// Verify the token
			const decoded = jwt.verify(
				token,
				process.env.JWT_PRIVATE_KEY || 'fallback_key_01771615835'
			) as IUser;

			// Set the user property on the request object
			req.user = await User.findById(decoded?._id).select('-password');
			// Call the next middleware function
			next();
		} catch (error: any) {
			// If the token is invalid, return a 401 response
			return res.status(401).json({
				status: 'error',
				message: 'Not authorized, token failed',
			});
		}
	}

	if (!token) {
		// If the token is not available, return a 401 response
		return res.status(401).json({
			status: 'error',
			message: 'Not authorized, no token',
		});
	}
};
