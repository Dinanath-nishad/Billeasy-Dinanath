import { string } from 'joi';
import mongoose, { Document, Schema, model } from 'mongoose';

interface IServise extends Document {
    name: string;
    data: Buffer;
    contentType: string;
    carpenter: String;
    plumber: String;
    ColorAndWallPutty: String;
    tiles: String;
    Interior: String;
    description: String;
    rating: Number,
    DesignName: string;
    Title: String

    photo: {
        name: string;
        data: Buffer;
        contentType: string;

    }[];

}

const serviceSchema = new Schema<IServise>({
    name: String,
    data: Buffer,
    contentType: String,

    carpenter: {
        type: String,
        required: false
    },
    ColorAndWallPutty: {
        type: String,
        required: false
    },
    tiles: {
        type: String,
        required: false
    },
    plumber: {
        type: String,
        required: false
    },
    Interior: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    rating: {
        type: Number
    },
    DesignName: {
        type: String,
    },
    Title: {
        type: String,
        required: false
    },

    photo: [{
        name: String,
        data: Buffer,
        contentType: String,
    }]
});

const Service = model<IServise>('Service', serviceSchema);

export default Service;
export { IServise };