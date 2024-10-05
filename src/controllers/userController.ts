import { Request, Response } from "express";
import mongoose from 'mongoose';
import User, { IUser } from '../models/userSchema'
import Ticket from '../models/TicketSchema'
import { userValidationSchema, loginValidationSchema } from "../utils/schemaValidation";
import bcrypt from "bcrypt";
import { Document } from 'mongoose';
import { CustomRequest } from '../middleware/authenticateJWT'
import { ParsedQs } from 'qs';




export const register = async (req: Request, res: Response) => {
   try {
      // Validate user input
      const { error, value } = userValidationSchema.validate(req.body);
      console.log("first", error)
      if (error) {
         return res.status(400).json({ error: error.details.map(detail => detail.message).join(', ') });
      }
      const { name, email, password, type } = value;
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
         return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const newUser = new User({ name, email, password, type });
      await newUser.save();
      return res.status(201).json({
         user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email
         }
      });
   } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
   }
}


export const userLogin = async (req: Request, res: Response) => {
   try {

      const { email, password } = req.body;
      const secretKey = "DINADRRSPVTLTD";


      if (!email || !password) {
         return res.status(400).json({ error: "Plz fill the data" });
      }
      const userLogin = await User.findOne({ email: email });

      if (userLogin) {
         const isMatch = await bcrypt.compare(password, userLogin.password);
         if (!isMatch) {
            return res.status(400).json({ error: "Invlalid Credentials" });
         } else {
            const token = await userLogin.generateAuthToken();
            await User.updateOne({ email: email }, { $set: { "token": token } }, { multi: true })
            res.cookie("jwtoken", token, {
               expires: new Date(Date.now() + 86400000), httpOnly: false
            });
            return res.status(200).json({ success: true, token });
         }
      } else {
         return res.status(400).json({ error: "Invlalid Credentials" });

      }



   } catch (error) {

   }
}







export const createTicket = async (req: CustomRequest, res: Response) => {
   try {
      const { title, description, type, venue, status, price, priority, dueDate } = req.body;

      const createdBy = req.rootUser?._id;

      if (!createdBy) {
         return res.status(400).json({ message: 'User ID not found' });
      }


      const newTicket = new Ticket({
         title,
         description,
         type,
         venue,
         status,
         price,
         priority,
         dueDate,
         createdBy,
         assignedUsers: []
      });

      // Save the ticket
      const savedTicket = await newTicket.save();
      return res.status(201).json(savedTicket);

   } catch (error) {
      return res.status(500).json({ message: 'Error creating ticket', error });
   }
};





// Assign a User to a Ticket

export const assignUserToTicket = async (req: CustomRequest, res: Response) => {
   const { ticketId } = req.params;
   const { userId } = req.body;

   try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
         return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.status === 'closed') {
         return res.status(400).json({ message: 'Cannot assign users to a closed ticket' });
      }

      const user = await User.findById(userId);

      if (!user) {
         return res.status(400).json({ message: 'User does not exist' });
      }


      if (user.type === 'admin') {
         return res.status(403).json({ message: 'Cannot assign ticket to an admin' });
      }


      if (ticket.assignedUsers.some(assignedUser => assignedUser.userId.toString() === userId)) {
         return res.status(400).json({ message: 'User already assigned' });
      }


      if (ticket.assignedUsers.length >= 5) {
         return res.status(400).json({ message: 'User assignment limit reached' });
      }

      // const creator = await User.findById(ticket.createdBy) as IUser | null;
      // console.log("creator", ticket.createdBy)
      // if (creator === null || (!req.rootUser || (req.rootUser.email.toString() !== creator.email.toString() && req.rootUser.type !== 'admin'))) {
      //    return res.status(403).json({ message: 'Unauthorized' });
      // }

      // Assign the user to the ticket with their details
      ticket.assignedUsers.push({
         userId: user._id as mongoose.Types.ObjectId,
         name: user.name || 'Unknown User',
         email: user.email || 'unknown@example.com'
      });
      await ticket.save();

      return res.status(200).json({ message: 'User assigned successfully' });
   } catch (error) {
      return res.status(500).json({ message: 'Error assigning user', error });
   }
};






// Get Ticket Details
export const getTicketDetails = async (req: CustomRequest, res: Response) => {
   try {
      const { ticketId } = req.params;


      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
         return res.status(404).json({ message: 'Ticket not found' });
      }

      // Prepare the response data
      const response = {
         id: ticket._id,
         title: ticket.title,
         description: ticket.description,
         type: ticket.type,
         venue: ticket.venue,
         status: ticket.status,
         price: ticket.price,
         priority: ticket.priority,
         dueDate: ticket.dueDate,
         createdBy: ticket.createdBy,
         assignedUsers: ticket.assignedUsers,
         statistics: {
            totalAssigned: ticket.assignedUsers.length,
            status: ticket.status,
         }
      };

      return res.status(200).json(response);

   } catch (error) {
      return res.status(500).json({ message: 'Error fetching ticket details', error });
   }
};








// Ticket History 

export const getTicketAnalytics = async (req: Request, res: Response) => {
   const { startDate, endDate, status, priority, type, venue } = req.query;
   console.log('Received query:', req.query); // Log incoming query parameters
   try {
      // Build the filter object
      const filter: any = {};

      if (startDate) {
         filter.createdDate = { $gte: new Date(startDate as string) }; // Filter for tickets created after startDate
      }

      if (endDate) {
         filter.createdDate = { ...filter.createdDate, $lte: new Date(endDate as string) }; // Filter for tickets created before endDate
      }

      if (status) {
         filter.status = status; // Filter by status
      }

      if (priority) {
         filter.priority = priority; // Filter by priority
      }

      if (type) {
         filter.type = type; // Filter by type
      }

      if (venue) {
         filter.venue = venue; // Filter by venue
      }

      console.log("Filter object:", filter); // Log filter object before query

      // Fetch tickets based on the filter
      const tickets = await Ticket.find(filter);
      console.log("Fetched tickets:", tickets); // Log fetched tickets

      // Calculate the analytics
      const totalTickets = tickets.length;
      const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
      const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
      const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;

      // Priority and type distribution
      const priorityDistribution = {
         low: tickets.filter(ticket => ticket.priority === 'low').length,
         medium: tickets.filter(ticket => ticket.priority === 'medium').length,
         high: tickets.filter(ticket => ticket.priority === 'high').length,
      };

      const typeDistribution = {
         concert: tickets.filter(ticket => ticket.type === 'concert').length,
         conference: tickets.filter(ticket => ticket.type === 'conference').length,
         sports: tickets.filter(ticket => ticket.type === 'sports').length,
      };

      // Prepare response data
      const responseData = {
         totalTickets,
         closedTickets,
         openTickets,
         inProgressTickets,
         priorityDistribution,
         typeDistribution,
         tickets: tickets.map(ticket => ({
            id: ticket._id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            type: ticket.type,
            venue: ticket.venue,
            createdDate: ticket.createdDate,
            createdBy: ticket.createdBy,
         }))
      };

      // Send response
      return res.status(200).json(responseData);
   } catch (error) {
      console.error("Error in getTicketAnalytics:", error);
      return res.status(500).json({ message: 'Error fetching ticket analytics', error });
   }
};
