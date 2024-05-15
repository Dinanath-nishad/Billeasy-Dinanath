import { Request, Response } from "express";
import User, { IUser } from '../models/userSchema'
import sgMail from '@sendgrid/mail';
import Otp from "../models/otpSchema"
import { userValidationSchema, loginValidationSchema } from "../utils/schemaValidation";

import bcrypt from "bcrypt";
import jwt, { } from 'jsonwebtoken';
import { error } from "console";
import Carpenter, { ICarpenter } from "../models/carpenterSchema";
import nodemailer from "nodemailer"
import { Document } from 'mongoose';
import { number } from "joi";
import { decrypt } from 'n-krypta';

var smtpTransport = nodemailer.createTransport({

   host: "email-smtp.ap-south-1.amazonaws.com",
   port: 465,
   secure: true, // use TLS
   auth: {
      user: "AKIAZ33XIBC6I232W3KC",
      pass: "BD/BxHPFDgCVEYQMs+YyQp0EEnAnO1HJmICvq7c5XmDq",
   },
});


interface SignUpBody {
   first_name: string,
   last_name: string,
   age: number,
   address: string,
   email: string
   password: string
   token: string
}

// export const register = async (req: Request, res: Response) => {
//    const { first_name, last_name, age, address, email, password, token = "" }: SignUpBody = req.body;

//    try {
//       const newUser = new User({ first_name, last_name, address, email, password, age, token });
//       const existingUser = await User.findOne({ email: email });
//       if (existingUser) {
//          return res.status(400).json({ message: 'User already exists' });
//       }
//       else {
//          await newUser.save();
//          return res.status(201).json({ message: 'User registered successfully' });
//       }

//    } catch (error) {
//       console.error('Error during user registration:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//    }
// }



export const register = async (req: Request, res: Response) => {
   try {
      // Validate user input
      const { error, value } = userValidationSchema.validate(req.body);
      if (error) {
         return res.status(400).json({ error: error.details.map(detail => detail.message).join(', ') });
      }
      const { first_name, email, password, confirm_password } = value;
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
         return res.status(400).json({ message: 'User already exists' });
      }
      // Create new user
      const newUser = new User({ first_name, email, password, confirm_password, });
      await newUser.save();
      return res.status(201).json({ message: true });
   } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}




interface SignIn {
   email: string
   password: string
}
export const login = async (req: Request, res: Response) => {

   try {
      const { error, value } = userValidationSchema.validate(req.body);
      if (error) {
         return res.status(400).json({ error: error.details.map(detail => detail.message).join(', ') });
      }
      const { email, password }: SignIn = value;

      const SECRET_KEY: string = "dinanath";
      const user = await User.findOne({ email: email });

      if (!user) {
         return res.status(401).json({ error: "invalid credentials" });
      }

      // Compare password asynchronously
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.status(402).json({ error: "invalid credentials" });
      }

      // Generate OTP
      const otp = Math.floor(Math.random() * 100000 + 100000).toString();

      // Update user's token
      const token = jwt.sign({ _id: user._id?.toString(), email: user.email }, SECRET_KEY, {
         expiresIn: '2 days',
      });
      await User.updateOne({ email: email }, { $set: { token: token } });

      // Send OTP via email
      const otpData = {
         email, otp: await bcrypt.hash(otp, 12), createdAt: new Date(),
      };

      await Otp.create(otpData);
      const mailOptions = {
         from: "helpdesk@hackersprey.com",
         to: email,
         subject: "OTP TO LOGIN",
         html: `Dear Subscriber,<br><br>
               Greetings,<br><br>
               Your Email One Time Password (OTP) is ${otp}.<br><br>
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

      smtpTransport.sendMail(mailOptions, function (error, info) {
         if (error) {
            console.log("Error:", error);
            return res.status(401).json({ error: "Failed to send OTP email" });
         } else {
            console.log("Message %s sent: %s", info.messageId, info.response);
            smtpTransport.close();
            return res.status(200).json({ message: "OTP sent to email" });
         }

      });
   } catch (error) {
      console.error('Error during user login:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}


export const userLogin = async (req: Request, res: Response) => {
   try {

      const { email, password } = req.body;
      const secretKey = "DINADRRSPVTLTD";
      const decrpt = decrypt(password, secretKey);

      if (!email || !password) {
         return res.status(400).json({ error: "Plz fill the data" });
      }
      const userLogin = await User.findOne({ email: email });
      console.log("first", decrpt)
      if (userLogin) {
         const isMatch = await bcrypt.compare(decrpt, userLogin.password);
         if (!isMatch) {
            return res.status(400).json({ error: "Invlalid Credentials" });
         } else {
            const token = await userLogin.generateAuthToken();
            await User.updateOne({ email: email }, { $set: { "token": token } }, { multi: true })
            res.cookie("jwtoken", token, {
               expires: new Date(Date.now() + 86400000), httpOnly: false
            });
         }
      } else {
         return res.status(400).json({ error: "Invlalid Credentials" });

      }



   } catch (error) {

   }
}
interface verifyOtp {
   email: String
   otp: Number
}
interface UserDocument extends Document {
   generateAuthToken(): Promise<string>;
   // Add other properties or methods if needed
}

export const verifyOtp = async (req: Request, res: Response) => {
   try {
      const { email, otp } = req.body;
      const jwtToken: string | undefined = req.cookies.jwtoken;
      if (jwtToken) {
         return res.status(403).json({ message: "You are already logged in." })
      }

      const otpVerification = await User.findOne({ email: email }) as UserDocument;
      if (!otpVerification) {
         return res.status(404).json({ message: "Invalid credentials." });
      }

      const otpdata = await Otp.findOne({ email });

      if (!otpdata) {
         return res.status(403).json({ message: "Please generate a new OTP" });
      }

      const isValidOtp = bcrypt.compareSync(otp, otpdata.otp);

      if (!isValidOtp) {
         return res.status(401).json({ message: "Invalid credentials" });
      }
      else {
         const token = await otpVerification.generateAuthToken();
         // Update user token
         await User.updateOne({ email: email }, { $set: { "token": token } }, { multi: true });
         // Set JWT token in cookie
         res.cookie("jwtoken", token, { expires: new Date(Date.now() + 86400000), httpOnly: false });
         return res.status(200).json({ message: "user loging successfully" });
      }
   } catch (error) {
      console.error('Error during OTP verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
};



// export const postCarpenter = async (req: Request, res: Response) => {
//    try {
//       const { title, description, workType, itemName, repairType, estimatedCost, dateRequested, status }: ICarpenter = req.body;
//       const photo: { name: string, data: Buffer, contentType: string }[] = req.body.photo;
//       console.log(req.body, "first", photo)
//       // Check if photo array exists and contains elements
//       if (!photo || photo.length === 0) {
//          return res.status(400).json({ message: 'No photo data provided' });
//       }

//       const { name, data, contentType } = photo[0];
//       const carpenter = await Carpenter.findOne({ title: title });
//       if (carpenter) {
//          return res.json({ message: "User already exists..." });
//       }

//       await Carpenter.create({
//          title, description, workType, itemName, repairType, estimatedCost, dateRequested, status, photo: [{ name, data, contentType }]
//       });

//       return res.status(201).json({ message: 'Carpenter created successfully!' });
//    } catch (error) {
//       console.error('Error during user registration:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//    }
// }




export const getCarpenter = async (req: Request, res: Response) => {
   try {
      const getCarpenter = await Carpenter.find().lean();
      if (!getCarpenter) {
         throw error("No data found!");
      }
      else {
         return res.json(getCarpenter);
      }
   } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}
export const getParamsCar = async (req: Request, res: Response) => {
   try {

      const id = req.params.id;
      const getUserData = await Carpenter.findById(id)
      if (!getUserData) {
         return res.status(404).json({ message: "Invalid User ID" })
      }
      else {
         return res.status(200).json(getUserData);
      }
   } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
   }
}






