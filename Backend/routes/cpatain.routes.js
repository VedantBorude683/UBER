const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const captainController=require('../controllers/captain_controller');
const authMiddleware=require('../middleware/auth.middleware');
router.post('/register',[
    body('email').isEmail().withMessage('invalid email'),
    body('fullname.firstname').isLength({min:3}).withMessage('first name must be 3 characters long'),
    body('password').isLength({min:6}).withMessage('password must be atleast 6 character long'),
    body('vehicle.color').isLength({min:6}).withMessage('color must be atleast 6 character long'),
    body('vehicle.plate').isLength({min:6}).withMessage('plate must be atleast 6 character long'),
    body('vehicle.vehicletype').isLength({min:3}).withMessage('vehicle type must be 3 character long'),
    body('vehicle.capacity').isLength({min:3}).withMessage('vehicle capacity must be 3 character long'),


],
    captainController.registerCaptain)
    router.post('/login',
            [body('email').isEmail().withMessage('invalid email'),
            body('password').isLength({min:6}).withMessage('password must be atleast 6 character long')],
        captainController.loginCaptain)

        router.get('/profile',authMiddleware.authCaptain,captainController.getCaptainProfile)
        router.get('/logout',authMiddleware.authCaptain,captainController.logoutCaptain)
module.exports=router;

