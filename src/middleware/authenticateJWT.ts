
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/userSchema';

export interface CustomRequest extends Request {
    rootUser?: IUser;
    name?: string;
    token?: string;
    email?: string;
}

interface DecodedToken {
    _id: string;
}

const authenticateJWT = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Authentication failed. Token missing.');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as DecodedToken;


        const rootUser = await User.findOne({
            _id: new Types.ObjectId(decoded._id), token,
        }) as IUser | null;


        if (!rootUser) {
            throw new Error('Authentication failed. Token missing.');
        }

        req.rootUser = rootUser as IUser;
        req.email = rootUser.email;
        req.name = rootUser.name

        req.token = rootUser.token;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Authentication failed.' });
    }
};

export default authenticateJWT;
