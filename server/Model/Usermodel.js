const mongoose  = require("mongoose");
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profile:{
    type:String,
    default:"",
  }
});
module.exports=mongoose.model("user",userSchema);

