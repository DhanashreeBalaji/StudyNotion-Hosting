const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    //A category can have multiple courses under it.
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],

});
//Export the Category Model
module.exports = mongoose.model("Category",CategorySchema);