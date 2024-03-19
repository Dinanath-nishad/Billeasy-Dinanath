import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();
import { login, register, postCarpenter, getCarpenter, getParamsCar, verifyOtp } from '../controllers/userController'
import { validateUserData } from '../middleware/validators';




router.post('/register', register);
router.post('/login', login);

router.post('/add_carpenter', postCarpenter);
router.get('/get_carpenter', getCarpenter);

router.get('/get_params/:id', getParamsCar);
router.post('/verify', verifyOtp);


export default router;