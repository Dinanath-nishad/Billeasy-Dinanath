import { Document, model, Schema } from 'mongoose';

export interface Otp extends Document {
    email: string;
    otp: string;
    createdAt: Date
}

const otpSchema: Schema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: { expires: '2m' },
    }
});

const Otp = model<Otp>('Otp', otpSchema);
export default Otp