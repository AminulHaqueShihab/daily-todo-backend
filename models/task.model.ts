import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';

export type TaskType = Document & {
	title: string;
	description?: string;
	userID: mongoose.Schema.Types.ObjectId;
	deadline?: Date;
	isCompleted: boolean;
};

const TaskSchema = new Schema<TaskType>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1024,
		},
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
		description: {
			type: String,
			required: false,
			trim: true,
		},
		deadline: {
			type: Date,
			required: false,
		},
		isCompleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const Task = mongoose.model<TaskType>('Task', TaskSchema);

export default Task;
