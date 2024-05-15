import express, { NextFunction, Request, Response } from 'express';
const router = express.Router();
import { login, register, getCarpenter, getParamsCar, verifyOtp, userLogin } from '../controllers/userController'
import { createAppointment, getAllService, postServise } from '../controllers/scheduleController'
import { validateUserData } from '../middleware/validators';

import { getBlog, getAllBlogs, getAllCarpenter, getIdCarpenter, postBlog, postCarpenter } from '../controllers/serviseController';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const upload = multer({ dest: 'uploads/', preservePath: true });

// const upload = multer({ dest: 'uploads/' }); 


router.post('/register', register);
router.post('/login', login);
router.post('/signin', userLogin)

// router.post('/add_carpenter', upload.single('photo'), postCarpenter);
router.post('/verify', verifyOtp);


router.post('/appointments/book', createAppointment);
router.post('/upload', upload.single('photo'), postServise);
router.get('/getAllService', getAllService);

// Carpenter routes
router.post('/post_carpenter', upload.single('photo'), postCarpenter)
router.get('/get_carpenter', getAllCarpenter);
router.post('/get_carpenter/:id', getIdCarpenter);


//Blog routes here
router.post('/postblog', upload.single('photo'), postBlog);
router.get('/getAllblog', getAllBlogs);
router.post('/getblog/:id', getBlog);


export default router;