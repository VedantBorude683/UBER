const captainModel=require('../models/captain.model');
module.exports=async({
    firstname,lastname,email,password,color,plate,vehicletype,capacity
})=>{
    if(!firstname || !lastname || !email || !password || !color || !plate || !vehicletype || !capacity){
        throw new Error('All fields are required');
    }
    const captain=captainModel({
        fullname:{
            firstname,
            lastname
        },
        email,
        password,
        vehicle:{
            color,
            plate,
            vehicletype,
            capacity
        }
    })
    return captain;
}