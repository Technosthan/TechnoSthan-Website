const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    name :String,
    email: {type: String,unique: true},
    password: String,
    googleId: String, // For Google OAuth
    role : {type:String, default: "user"} //admin and user
}, {timestamps:true});
module.exports = mongoose.model("User",
    userSchema);
