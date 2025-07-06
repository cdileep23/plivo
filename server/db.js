import mongoose from "mongoose";
const connectDB=async()=>{
const MONGO_URL = process.env.MONGO_URL;
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected To Database")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB