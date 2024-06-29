import { required } from "joi";
import { Schema, model, Document } from "mongoose";
interface IBlog {
    name: string;
    data: Buffer;
    contentType: string;


    title: string;
    description: string;
    author: string;
    designation: string;
    category: string;
    photo: { name: string, data: Buffer, contentType: string }[];
    authorPhoto: string
    content: { type: string, data: string }[]
    links: { internal_link: string }[]
    subTitle: string
}


const blogSchema = new Schema<IBlog>({

    name: String,
    data: Buffer,
    contentType: String,

    title: {
        type: String,
        required: false
    },
    subTitle: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    author: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    category: {
        type: String,
    }
    ,

    photo: [{
        name: String,
        data: Buffer,
        contentType: String,
    }],
    authorPhoto: {
        type: String,
        required: false
    },
    content: [{
        type: {
            type: String,
            required: false
        },
        data: {
            type: String,
            required: false
        }
    }],
    links: [{
        internal_link: {
            type: String,
            required: false
        }
    }],

},
)
// Single field index
blogSchema.index({ title: 1 });
// Compound index
blogSchema.index({ description: 1, title: -1 });

const Blog = model<IBlog>('Blog', blogSchema);

export default Blog
export { IBlog };
