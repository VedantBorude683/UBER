const express=require("express");
const app=express();

const dotenv=require("dotenv");
dotenv.config();
const cors=require("cors");
const userRoutes=require('./routes/user.routes');
const connectDB=require("./db/db")
const cookieParser=require('cookie-parser');
const captainRoutes=require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideroutes = require('./routes/ride.routes');
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({origin: frontendOrigin,
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

// Keep route/service failures from becoming an HTML error page or taking down
// the process. Individual controllers can still return their own status code.
app.use((err, req, res, next) => {
    console.error('Unhandled request error:', err.message);
    if (res.headersSent) return next(err);
    return res.status(err.status || 500).json({ message: 'Internal server error' });
});
connectDB();

module.exports=app;
