
import { Request, Response } from "express";
import User from '../models/userSchema'
import Otp from "../models/otpSchema"
import Carpenter, { ICarpenter } from "../models/carpenterSchema";
import AppointmentModel, { IAppointment } from '../models/appointmentSchema';
import Service, { IServise } from "../models/service";
const mongoose = require('mongoose');
import Blog from "../models/blog";

import redisData from '../redisClient'






export async function postCarpenter(req: Request, res: Response) {
    const { title, description, category, rating, skills, experience, availability, pricing, portifolio, toolsAndEquipment } = req.body;

    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const serviceData = await Carpenter.findOne({ title: title });

        if (serviceData) {
            // If service exists, check if the photo already exists
            const photoExists = serviceData.photo.some(item => item.name === req.file?.originalname);

            if (photoExists) {
                return res.status(200).json({ message: "Photo already exists." });
            } else {
                // Push new photo to existing service
                await Carpenter.updateOne({ _id: serviceData._id }, {
                    $push: {
                        photo: {
                            name: req.file.originalname,
                            data: req.file.buffer,
                            contentType: req.file.mimetype,
                        }
                    }
                });
                return res.status(200).json({ message: "New photo added to existing service." });
            }
        } else {
            // If service doesn't exist, create a new one
            const newService = new Carpenter({
                name: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype,
                title, description, category, rating, skills, experience, availability, pricing, portifolio, toolsAndEquipment,
                photo: [{
                    name: req.file.originalname,
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                }],
            });
            console.log(newService)
            await newService.save();
            return res.status(200).send({ message: 'Services uploaded successfully.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }
}

export async function getAllCarpenter(req: Request, res: Response) {
    try {
        const getdata = await Carpenter.find({}).lean()
        if (getdata.length == 0) {
            return res.status(403).json({ message: "there is no data!" })
        }
        else {
            return res.status(200).json({ getdata })
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }

}

export async function getIdCarpenter(req: Request, res: Response) {
    try {
        const id = req.params.id
        const iddata = await Carpenter.findOne({ _id: id })
        return res.status(200).json({ iddata })
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }
}

//Blogs API start from here..

export async function postBlog(req: Request, res: Response) {
    try {
        const { title, description, author, designation, category } = req.body;

        if (!title || !description || !author || !designation || !category) {
            return res.status(409).json({ message: "all fields required!" })
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const iddata = await Blog.findOne({ title: title })
        if (iddata) {
            return res.status(409).json({ message: "This blog already exists." })
        }
        //create new blog
        const newblog = new Blog({
            title, description, author, designation, category,
            name: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype,

        })

        newblog.save()
        await redisData.del('allBlogs');
        return res.status(200).json({ message: "blog post successfully" })

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }
}


// export async function getAllBlogs(req: Request, res: Response) {
//     try {
//         const allBlog = await Blog.find({}).lean();
//         if (allBlog.length === 0) {
//             return res.status(404).json({ message: "No blogs found" });
//         }
//         return res.status(200).json(allBlog);
//     } catch (error) {
//         console.error('Error fetching blogs:', error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// }

// export async function getBlog(req: Request, res: Response) {
//     try {
//         const id = req.params.id
//         const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

//         if (!isValidObjectId) {
//             // Handle invalid ObjectId
//             return res.status(400).json({ error: 'Invalid ObjectId' });
//         }
//         const blog = await Blog.findById(req.params?.id).select('title subtitle description category content links data contentType metadescription metakeywords content tags faq reletedServise');

//         return res.status(200).json(blog)
//     } catch (error) {
//         return res.status(500).json({ error: "Internal server error" });
//     }

// }




export async function getAllBlogs(req: Request, res: Response) {
    try {
        const cacheKey = 'allBlogs';

        // Check if the data exists in the cache
        redisData.get(cacheKey, async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // Data exists in the cache, return it
                const allBlog = JSON.parse(cachedData);
                console.log("chache data")

                return res.status(200).json(allBlog);
            } else {
                // Data not in cache, fetch from the database
                const allBlog = await Blog.find({}).lean();
                if (allBlog.length === 0) {
                    return res.status(404).json({ message: 'No blogs found' });
                }
                // Store data in cache
                redisData.setex(cacheKey, 3600, JSON.stringify(allBlog)); // Expiry time: 1 hour (3600 seconds)
                console.log("normal data")
                return res.status(200).json(allBlog);
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



export async function getBlog(req: Request, res: Response) {
    try {
        const id = req.params.id
        const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

        if (!isValidObjectId) {
            return res.status(400).json({ error: 'Invalid ObjectId' });
        }

        // Check if the data exists in the cache
        redisData.get(`blog:${id}`, async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (cachedData) {
                // Data exists in the cache, return it
                const blog = JSON.parse(cachedData);
                console.log("first blog chache  data",)
                return res.status(200).json(blog);
            } else {
                // Data not in cache, fetch from the database
                const blog = await Blog.findById(id).select('title subtitle description category content links data contentType metadescription metakeywords content tags faq reletedServise');

                if (blog) {
                    // Store data in cache
                    console.log("first blog data",)
                    redisData.setex(`blog:${id}`, 3600, JSON.stringify(blog)); // Expiry time: 1 hour (3600 seconds)
                    return res.status(200).json(blog);
                } else {
                    return res.status(404).json({ error: 'Blog not found' });
                }
            }
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}


//update blog 
export async function updateBlog(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const title = req.body;

        const updatedBlog = await Blog.findByIdAndUpdate(id, title, { new: true });

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const cacheKey = `blog:${id}`;

        // Clear cache for this blog and all blogs
        await redisData.del(cacheKey);
        await redisData.del('allBlogs');

        return res.status(200).json(updatedBlog);
    } catch (error) {
        console.error('Error updating blog:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteBlog(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const cacheKey = `blog:${id}`;

        // Clear cache for this blog and all blogs
        await redisData.del(cacheKey);
        await redisData.del('allBlogs');

        return res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export async function clearCache(req: Request, res: Response) {
    try {
        redisData.flushdb((err, result) => {
            if (err) {
                console.error('Error clearing cache:', err);
                return res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('Cache cleared successfully for the current database');
                return res.status(200).json({ message: 'Cache cleared successfully for the current database' });
            }
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}