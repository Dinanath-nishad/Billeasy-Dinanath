import express from 'express';
const router = express.Router();
import { createTicket, register, userLogin, assignUserToTicket, getTicketDetails, getTicketAnalytics } from '../controllers/userController'

import { validateUserData } from '../middleware/validators';

import authenticateJWT from "../middleware/authenticateJWT"
router.post('/register', register);

router.post('/auth/login', userLogin)
router.post('/ticket', authenticateJWT, createTicket);
router.post('/tickets/:ticketId/assign', authenticateJWT, assignUserToTicket);
router.get('/tickets/:ticketId', authenticateJWT, getTicketDetails);

router.get('/tickets/analytics', authenticateJWT, getTicketAnalytics);
router.get('/analytics', getTicketAnalytics);
export default router;