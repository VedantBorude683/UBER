const http=require('http');
const { initializeSocket } = require('./socket');
const app=require('./app')
const PORT=process.env.PORT || 8080
const server=http.createServer(app);
initializeSocket(server);
server.listen(PORT,()=>{
    console.log("server is working")
});