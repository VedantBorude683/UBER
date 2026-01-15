const express=require("express");
const app=express();

const dotenv=require("dotenv");
dotenv.config();
const cors=require("cors");
const userRoutes=require('./routes/user.routes');
const connectDB=require("./db/db")
const cookieParser=require('cookie-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get("/hello",(req,res)=>{
    res.send("hello");
})
app.use('/user',userRoutes);

connectDB();

module.exports=app;