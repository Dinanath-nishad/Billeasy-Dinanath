import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';  // Import your Cloudinary config

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
});

const upload = multer({ storage });

export default upload;