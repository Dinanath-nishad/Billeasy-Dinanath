import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

interface Carpenter {
    first_name: string;
    last_name: string;
    email: string;
 
    address: string;
    experience: number;
    token: string
}

const CarpenterSchema = new Schema<Carpenter>({
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
   
    address: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        required: false
    },

},
    { timestamps: true }
)





const Carpenter = model<Carpenter>('carpenter', CarpenterSchema);

export default Carpenter