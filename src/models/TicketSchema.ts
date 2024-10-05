import mongoose, { Document, Schema } from 'mongoose';

interface IAssignedUser {
    userId: mongoose.Types.ObjectId; // Ensure this is an ObjectId
    name: string; // Name should not be undefined
    email: string; // Email should not be undefined
}

interface ITicket extends Document {
    title: string;
    description: string;
    type: string;
    venue: string;
    status: string;
    price: number;
    priority: string;
    dueDate: Date;
    createdBy: mongoose.Types.ObjectId;
    assignedUsers: IAssignedUser[];
    createdDate: Date
    startDate: Date,
    endDate: Date
}

const ticketSchema = new Schema<ITicket>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['concert', 'conference', 'sports'], required: true },
    venue: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    price: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, required: true, validate: { validator: (v: Date) => v > new Date() } },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    assignedUsers: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
