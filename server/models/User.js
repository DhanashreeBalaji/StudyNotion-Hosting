//Import the mongoose library
const mongoose = require("mongoose");

//Define the user schema using the mongoose schema constructor
const userSchema = new mongoose.Schema({

    firstName: {
        type:String,
        required:true,
        trim:true,
    },
    LastName: {
         type:String,
         required:true,
         trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password: {
        type:String,
        required:true,
    },
    accountType: {
        type:String,
        enum:["Admin", "Student", "Instructor"],
        required:true,
    },
    active: {
        type:Boolean,
        default:true,
    },
    approved: {
        type:Boolean,
        default:true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile",
    },
    courses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    image: {
        type:String,
        
    },
    courseProgress: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress",
        }
    ],
    

});

module.exports = mongoose.model("User", userSchema);
