const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({

    sectionName:{
        type:String,
    },
    //Under a section, multiple subsections would be there, and all their object_ids are added here
    subSection: [
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"SubSection",
        },
    ],

});
//Export the Section Schema
module.exports = mongoose.model("Section", sectionSchema);