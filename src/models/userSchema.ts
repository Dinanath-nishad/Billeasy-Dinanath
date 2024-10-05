import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret } from 'jsonwebtoken';


interface IUser extends Document {
    name?: string;
    email: string;
    type?: string;
    password: string;
    token?: string;
    generateAuthToken(): Promise<string>;
}

// Define the user schema
const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: false // Marking it as optional
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: false // Optional
    },
    token: {
        type: String,
        required: false // Optional
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this as IUser;
    if (user.isModified('password')) {
        const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
    next();
});

// Generate JWT Token method
userSchema.methods.generateAuthToken = async function (): Promise<string> {
    try {
        const user = this as IUser;
        const payload = { _id: user._id, email: user.email, name: user.name };
        const secretOrPrivateKey: Secret = process.env.SECRET_KEY || '';
        const token = jwt.sign(payload, secretOrPrivateKey, { expiresIn: '24h' });
        user.token = token; // Save the token
        await user.save(); // Save the user with the token
        return token;
    } catch (err) {
        console.error('Error generating auth token:', err);
        throw err;
    }
};

// Create and export the User model
const User = model<IUser>('User', userSchema);
export default User;
export { IUser };
