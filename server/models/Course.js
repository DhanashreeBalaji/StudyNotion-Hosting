const mongoose = require ("mongoose");

const courseSchema = new mongoose.Schema({
    courseName:{
        type:String,
        required:true,
       trim:true,
    },
    courseDescription:{
        type:String,
        required:true,
        trim:true,
    },
  instructor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
  },
  whatwillyoulearn:{
    type:String,
    required:true,
  },
  courseContent:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section",
        
    },
  ],
    ratingandReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingandReview",
            required:true,
        },
    ],
   price:{
         type:Number,
         required:true,
   },
   thumbnail: {
         type:String,
         required:true,
   },
   tag: {
		type: [String],
		required: true,
	},
   category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
   },
   studentsEnrolled:[
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
   ],
   instructions: {
    type: [String],
   },
status:{
  type:String,
  enum: ["Draft", "Published"],
},

});
//Export the course model

module.exports = mongoose.model("Course", courseSchema);