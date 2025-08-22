import mongoose from 'mongoose';

export const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB using Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB using Mongoose", err);
    process.exit(1); // Exit process with failure
  }
};