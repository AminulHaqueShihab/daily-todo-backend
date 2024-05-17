import mongoose, { Mongoose } from 'mongoose';

const dbConnect = async (): Promise<void> => {
	try {
		const connection: Mongoose = await mongoose.connect(
			process.env.MONGO_URI! as string,
			{
				// useNewUrlParser: true,
				// useUnifiedTopology: true,
			}
		);
		console.log(`MongoDB connected: ${connection.connection.host}`);
	} catch (error: any) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default dbConnect;
