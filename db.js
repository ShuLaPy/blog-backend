import mongoose from "mongoose";

const connectDB = async (cb) => {
  try {
    await mongoose.connect("mongodb://localhost:27017/the-blog", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Database");
    cb();
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
