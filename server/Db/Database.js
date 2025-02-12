import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const Db = mongoose.connect("mongodb://localhost:27017/ChatGpt")
  .then(() => {
    console.log("Database Connectivity");
  })
  .catch((error) => {
    console.error(error);
    console.log(error);
  });

export default Db;