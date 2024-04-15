const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({

    gender: {
        type:String,
    },
    dateOfBirth: {
        type:String,
    },
    about:{
        type:String,
        trim:true,
    },
   contactNumber:{
    type:Number,
    trim:true,
   }

});
//Export the Profile Model
module.exports = mongoose.model("Profile", ProfileSchema);