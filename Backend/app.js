const express=require("express");
const app=express();

const dotenv=require("dotenv");
dotenv.config();
const cors=require("cors");
const userRoutes=require('./routes/user.routes');
const connectDB=require("./db/db")
const cookieParser=require('cookie-parser');
const captainRoutes=require('./routes/cpatain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideroutes = require('./routes/ride.routes');
app.use(cors({origin: 'http://localhost:5173', 
    credentials: true}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.get("/hello",(req,res)=>{
    res.send("hello");
})
app.use('/users',userRoutes);
app.use('/maps', mapsRoutes);
app.use('/captains',captainRoutes);
app.use('/rides',rideroutes);
connectDB();

module.exports=app;