import express, { Request, Response } from "express";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import morgan from "morgan";
import helmet from 'helmet'
import cors from 'cors'
dotenv.config();
const app = express();

import "./db/dbconnect";



const PORT = process.env.PORT || 3000;
import router from './routes/userRoute';


app.use(cors());

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));


app.use(cookieParser());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());



app.get('/', (req: Request, res: Response): void => {
  res.json({ data: 'Hello, TypeScript Server!' });
});
app.use('/', router);

app.listen(PORT, (): void => {
  console.log(`Server is running on ${PORT}`)
})
