import express from 'express'
import connectDB from './db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import UserRouter from './routes/user.routes.js'
import cors from 'cors'
import http from 'http'
import OrgRouter from './routes/organization.route.js'
import ServiceRouter from "./routes/service.route.js";
import IncidentRouter from './routes/incident.route.js'
import { Server } from 'socket.io'
import RequestRouter from './routes/collabreq.route.js'
dotenv.config({})
const app=express()
app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:5173", "https://plivo-kappa.vercel.app"],
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://plivo-kappa.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
 
});
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("join-org-room", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);
app.use('/api/v1/user', UserRouter)
app.use("/api/v1/org", OrgRouter);
app.use("/api/v1/service", ServiceRouter);
app.use("/api/v1/incident", IncidentRouter);
app.use("/api/v1/request", RequestRouter);

const startServer=async()=>{
    const PORT=process.env.PORT
    try {
        await connectDB()
        server.listen(PORT, () => {
          console.log("✅ Server Started At 4545 PORT");
        });
    } catch (error) {
        console.log(error)
        
    }
}
startServer()

