import mongoose from 'mongoose';

import "dotenv/config";

const { DATABASE_CONNECTION_URL } = process.env;

const Db = mongoose.connect(DATABASE_CONNECTION_URL)
  .then(() => {
    console.log("Database Connectivity");
  })
  .catch((error) => {
    console.error(error);
    console.log(error);
  });

export default Db;