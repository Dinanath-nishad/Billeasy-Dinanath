import { Request, Response } from "express";
import User from '../models/userSchema'
import Otp from "../models/otpSchema"
import Carpenter from "../models/carpenterSchema";
import AppointmentModel, { IAppointment } from '../models/appointmentSchema';
import Service, { IServise } from "../models/service";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


import nodemailer from "nodemailer"
import { Document } from 'mongoose';
import { number } from "joi";




var smtpTransport = nodemailer.createTransport({

    host: "email-smtp.ap-south-1.amazonaws.com",
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.MAILERUSER,
        pass: process.env.MAILERPASSWORD,
    },
});



export async function createAppointment(req: Request, res: Response) {
    try {
        const appointmentData: IAppointment = req.body; // Assuming request body contains appointment data
        const newAppointment = new AppointmentModel(appointmentData);

        const savedAppointment = await newAppointment.save();
        // Send email notification
        await sendAppointmentConfirmationEmail(appointmentData);
        return res.status(200).json({ message: "Appointment confirmation email sent successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create appointment' });
    }
}

async function sendAppointmentConfirmationEmail(appointmentData: IAppointment) {
    try {

        const mailOptions = {
            from: "helpdesk@hackersprey.com",
            to: appointmentData.createdBy,
            subject: "OTP TO LOGIN",
            html: `Dear Subscriber,<br><br>
                  Greetings,<br><br>
                  Your Email One Time Password (OTP) is ${appointmentData}.<br><br>
                  Note:<br>
                  Please securely input OTP and do not share with anyone. OTP is valid for five minutes or one successful attempt, whichever is earlier. If you have not attempted this login, we request that you notify us immediately. You can write to us at helpdesk@hackersprey.com. We assure you of our best services at all times.<br><br>
                  Best Wishes,<br>
                  HackersPrey<br><br>
                  <a href='www.hackersprey.com'>www.hackersprey.com</a>`,
            // attachments: [
            //    {
            //       filename: 'hackersprey.png',
            //       path: './emailfooter.png',
            //       cid: 'unique_image_cid',
            //    },
            // ],
        };

        // Send email
        await smtpTransport.sendMail(mailOptions);

    } catch (error) {
        console.error('Error sending appointment confirmation email:', error);
    }
}

export const cancelAppointment = async (req: Request, res: Response) => {
    try {

    } catch (err) {
        res.status(500).json({ message: "internal server error" });
    }
};


export async function postServise(req: Request, res: Response) {
    const { Title, carpenter, DesignName, description, rating } = req.body;

    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const serviceData = await Service.findOne({ carpenter });

        if (serviceData) {
            // If service exists, check if the photo already exists
            const photoExists = serviceData.photo.some(item => item.name === req.file?.originalname);

            if (photoExists) {
                return res.status(200).json({ message: "Photo already exists." });
            } else {
                // Push new photo to existing service
                await Service.updateOne({ _id: serviceData._id }, {
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
            const newService = new Service({
                name: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype,
                carpenter,
                DesignName,
                description,
                rating,
                Title,
                photo: [{
                    name: req.file.originalname,
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                }],
            });
            await newService.save();
            return res.status(200).send({ message: 'Services uploaded successfully.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }
}

export async function getAllService(req: Request, res: Response) {
    try {
        const getAllservice = await Service.find({})

        return res.status(200).json(getAllservice);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(error);
    }
}