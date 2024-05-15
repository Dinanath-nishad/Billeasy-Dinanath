import { Schema, model, Document } from "mongoose";
interface IElectric {
    title: string;
    description: string;
    workType: string;
    itemName: string;
    repairType: String;
    estimatedCost: Number;
    dateRequested: String;
    status: String;
    photo: { name: string, data: Buffer, contentType: string }[];
}


const ElectricSchema = new Schema<IElectric>({
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    workType: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    repairType: {
        type: String,
        enum: ['Minor', 'Major'],
        required: true
    },
    estimatedCost: {
        type: Number,
        required: true
    },
    dateRequested: {
        type: Date,
        default: Date.now
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


const Electric = model<IElectric>('electric', ElectricSchema);

export default Electric
export { IElectric };