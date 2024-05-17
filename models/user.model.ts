import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';

export type UserType = Document & {
	name: string;
	email: string;
	phone: string;
	password: string;
	isActive: boolean;
	generateAuthToken: () => string;
};

const schema = new Schema<UserType>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
		},
		phone: {
			type: String,
			required: false,
			trim: true,
			unique: true,
			match: [/^(01\d{9})$/, 'Please fill a valid phone number'],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			maxlength: 1024,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

schema.methods.generateAuthToken = function (this: UserType) {
	const token = jwt.sign(
		{
			_id: this._id,
			name: this.name,
			email: this.email,
		},
		process.env.JWT_PRIVATE_KEY || 'fallback_key_01771615835'
	);
	return token;
};

const User = mongoose.model<UserType>('User', schema);
export default User;
