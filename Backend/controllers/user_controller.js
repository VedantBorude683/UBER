const usermodel=require("../models/user.model");
const userService=require("../services/user.service")
const {validationresult}=require('express-validator')
module.exports.registerUser=async(req,res,next)=>{
    const errors=validationresult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    const {fullname,email,password}=req.body;
    const hashpassword=await usermodel.hashpassword(password);
    const user=await userService.createUser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password:hashpassword
    });
    const token=user.generateAuthToken();
    res.status(201).json({token,user});
}
module.exports.loginUser=async (req,res,next)=>{
    const errors=validationresult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }
    const {email,password}=req.body;
    const user=await userModel.findOne({email}).select('+password');
    if(!user)
    {
        return res.status(401).json({messege:'invalid email or password'});

    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return res.status(401),json({messege:'invalid email or password'});

    }
    const token=user.generateAuthToken();
    res.status(200).json({token,user});
}