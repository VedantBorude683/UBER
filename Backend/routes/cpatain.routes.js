const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captain_controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    // Fixed: Color min length 3 (allows "Red", "Blue")
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    
    // Fixed: Plate min length 3
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    
    // Fixed: Capacity must be a Number (Int), not a string length
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    
    // Fixed: specific types + corrected spelling 'vehicleType'
    body('vehicle.vehicleType').isIn([ 'car', 'motorcycle', 'auto' ]).withMessage('Invalid vehicle type'),
],
    captainController.registerCaptain
)

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    captainController.loginCaptain
)

router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile)
router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain)

module.exports = router;