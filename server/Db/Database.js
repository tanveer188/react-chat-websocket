const dotenv=require("dotenv")
dotenv.config()
const {  mongoose } = require("mongoose");

const Db =mongoose.connect("mongodb://localhost:27017/ChatGpt")
.then(()=>{
    console.log("Database Connectivity");
})
.catch((error)=>{
    console.error(error)
    console.log(error);
})
module.exports=Db;