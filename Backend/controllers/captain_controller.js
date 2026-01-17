const captainModel=require('../models/captain.model');
const captainservice=require('../services/captain.service');
const blackListTokenModel=require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');
module.exports.registerCaptain=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{fullname,email,password,vehicle}=req.body;
    const iscaptainalreadyexist=await captainModel.findOne({email});
    if(iscaptainalreadyexist){
        return  res.status(400).json({message:'captain already exist'});
    }
   const hashPassword=await captainModel.hashPassword(password);
    const captain=await captainservice({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password:hashPassword,
        color:vehicle.color,
        plate:vehicle.plate,
        vehicletype:vehicle.vehicletype,
        capacity:vehicle.capacity
    });
    const token=captainModel.generateAuthToken(captain);
    return res.status(201).json({token,captain});
}
module.exports.loginCaptain=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{email,password}=req.body;
    const captain=await captainModel.findOne({email});
    if(!captain){
        return res.status(400).json({message:'captain not found'});
    }
    const isPasswordValid=await captainModel.comparePassword(password,captain.password);
    if(!isPasswordValid){
        return res.status(400).json({message:'invalid password'});
    }
    const token=captainModel.generateAuthToken(captain);
    return res.status(200).json({token,captain});
}
module.exports.logoutCaptain=async(req,res,next)=>{
    
    const token=req.cookies.token || req.headers.authorization.split(' ')[1];
   await blackListTokenModel.create({token:token});
   res.clearCookie('token');
    return res.status(200).json({message:'logout successful'});
}
module.exports.getCaptainProfile=async(req,res,next)=>{
    const captain=req.captain;
    return res.status(200).json({captain});
}