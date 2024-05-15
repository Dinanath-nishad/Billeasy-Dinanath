import mongoose, { Schema, Document } from 'mongoose';

// Define interface for Appointment document
interface IAppointment extends Document {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location: string;
    createdBy: string;
}

const AppointmentSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, required: true },
    createdBy: { type: String, required: true }
}, { timestamps: true });


const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
export { IAppointment };
