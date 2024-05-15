import { Schema, model, Document } from "mongoose";
interface ICarpenter {
    name: string;
    data: Buffer;
    contentType: string;

    title: string;
    description: string;
    category: String;
    skills: String;
    experience: String;
    availability: String;
    pricing: Number;
    portifolio: String;
    rating: Number;
    workType: string;
    itemName: string;
    repairType: String;
    toolsAndEquipment: String;
    certification: String;
    status: String;
    photo: { name: string, data: Buffer, contentType: string }[];

}


const CarpenterSchema = new Schema<ICarpenter>({
    name: String,
    data: Buffer,
    contentType: String,

    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    skills: {
        type: String,
        required: false
    },
    pricing: {
        type: Number,
        required: true
    },
    experience: {
        type: String,
        required: false
    },
    availability: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    workType: {
        type: String,
        required: false
    },
    itemName: {
        type: String,
        required: false
    },
    repairType: {
        type: String,
        enum: ['Minor', 'Major'],
        required: false
    },
    portifolio: {
        type: String,
        required: true
    },
    certification: {
        type: String,

    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    photo: [{
        name: String,
        data: Buffer,
        contentType: String,
    }]


},
    { timestamps: true }
)

const Carpenter = model<ICarpenter>('carpenter', CarpenterSchema);

export default Carpenter
export { ICarpenter };