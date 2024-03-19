import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

interface Testimonial {
    first_name: string;
    email: string;
    photo: string;
    description: string;
    title: string;
    experience: number;

}

const TestimonialSchema = new Schema<Testimonial>({
    first_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    photo: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: false
    },

},
    { timestamps: true }
)





const Testimonial = model<Testimonial>('testimonial', TestimonialSchema);
export default Testimonial