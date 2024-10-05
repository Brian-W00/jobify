import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
// routers
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import mongoose from 'mongoose';
// middleware
import errorHandlerMiddleWare from './middleware/errorHandlerMiddleware.js';
import { body, validationResult } from 'express-validator';
import { authenticateUser } from './middleware/authMiddleware.js';
import cookieParser from 'cookie-parser';
// public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import cloudinary from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, './public')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/v1/test', (req, res) => {
    res.json({msg: 'test route'});
});



app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', authenticateUser, userRouter);

// deploy
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public', 'index.html'));
})


app.use('*', (req, res) => {
    res.status(404).json({
        message: 'not found'
    });
});

app.use(errorHandlerMiddleWare);


const port = process.env.PORT || 5100;


try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(port, () => {
        console.log(`server running on port ${port}...`);
    });
} catch (error) {
    console.log(error);
    process.exit(1);
};


