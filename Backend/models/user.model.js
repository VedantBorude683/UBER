const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const userSchema=new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true,
            minlength:[3,'first name be atleat 3 characters long']
        },
        lastname:{
            type:String,
            minlength:[3,'last name be atleat 3 characters long']
        },
        email:{
            type:String,
            required:true,
            unqiue:true,
            minlength:[5,'email must be atleast 5 charcter long'],
        },
        password:{
            type:String,
            required:true,
            select:false

        },
        socketId:{
            type:String,
        }

    }
})
userSchema.methods.generateauthtoken=function (){
    const token=jwt.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn:'24h'})

    return token;
}
userSchema.methods.comparepasswords=async function (password){
    return await bcrypt.compare(password,this.password);
}
userSchema.statics.hashpasswords=async function (password){
    return await bcrypt.hash(password,10);
}

const usermodel=mongoose.model('User',userSchema);
module.exports=usermodel;