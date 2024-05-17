import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnect from './db.js';
import authRoute from './routes/auth.route.js';


const app: Application = express();

//middleware
app.use(express.json());
app.use(cors());
dotenv.config();
dbConnect();


//routes

app.use('/api/auth', authRoute);


const port: string | number = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

export default app;
