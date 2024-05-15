import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import jwt, { Secret } from 'jsonwebtoken';
interface IUser {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    address: string;
    age: number;
    token: string;
    generateAuthToken(): Promise<string>;
}

const userSchema = new Schema<IUser>({
    first_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // confirm_password: {
    //     type: String,
    //     required: true
    // },
    token: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },

},
    { timestamps: true }
)


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});



userSchema.methods.generateAuthToken = async function (): Promise<string> {
    try {
        const payload = { _id: this._id, email: this.email, name: this.first_name };
        const secretOrPrivateKey: Secret = process.env.SECRET_KEY || ''; // Specify the type for secretOrPrivateKey

        // Generate JWT token
        const token = jwt.sign(payload, secretOrPrivateKey);

        // Save the user document and await the promise
        await this.save();
        console.log(token, "auth token");
        return token;
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to be handled by the caller
    }
};

const User = model<IUser>('user', userSchema);

export default User
export { IUser };