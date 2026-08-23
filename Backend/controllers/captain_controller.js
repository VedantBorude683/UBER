const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service'); // Renamed for clarity
const blackListTokenModel = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exist' });
    }

    const hashedPassword = await captainModel.hashPassword(password);
   

    // 1. FIX: Call .createCaptain() (the function inside the file)
    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType // 2. FIX: Ensure CamelCase matches Service
    });
   
    // 3. FIX: Call generateAuthToken() on the instance 'captain', not the model
    const token = captain.generateAuthToken();
    const captainResponse = captain.toObject();
    delete captainResponse.password;

    res.status(201).json({ token, captain: captainResponse });
}

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const captain = await captainModel.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!captain || !captain.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await captain.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = captain.generateAuthToken();
        const captainResponse = captain.toObject();
        delete captainResponse.password;

        res.cookie('token', token);
        return res.status(200).json({ token, captain: captainResponse });
    } catch (error) {
        console.error('Captain login error:', error.message);
        return next(error);
    }
}

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
}

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    await blackListTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
}