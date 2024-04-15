const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const { mongo, default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req,res) => {
    try{
        //fetch user id
        const userId = req.user.id;
        //fetch data from request body
        const {courseId, rating, review} = req.body;
        //Check if user enrolled for the course or not
        const courseDetails = await Course.findOne(
            {_id:courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId} }
            }
        );

        if(!courseDetails){
            return res.status(401).json({
                success:false,
                message:"Student is not enrolled in the course",
            });
        }
        
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                             user:userId,
                                             course:courseId
        });
    

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
                
            });
        }

        //Create Rating and Review entry
        const RatingReview = await RatingAndReview.create({
                                       rating: rating,
                                       review:review,
                                       course:courseId,
                                       user:userId,
        });

        //add this rating and review in the course
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                        {_id:courseId},
                                        {
                                            $push: {
                                                ratingandReviews:RatingReview._id,
                                            },
                                        },
                                        {new:true},
        );
        //console.log(updatedCourseDetails);
        
        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            RatingReview,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//Get Average Rating
exports.getAverageRating = async (req,res) => {
    try{
        //get course id whose average rating we need
        const courseId = req.body.courseId;
        
        //Calculate average rating
        const result = await RatingAndReview.aggregate([
                  {
                        $match:{
                            course: new mongoose.Types.ObjectId(courseId),
                        },
                  },
                  {
                        $group:{
                            _id:null,
                            averagerating : {$avg : "$rating"},
                        }
                  }
                ])

                //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }

            //If no Ratings and Reviews yet
            return res.status(401).json({
                success:false,
                message:"Avearge Rating is 0, no ratings yet",
            });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get All Ratings
exports.getAllRating = async (req,res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                          .sort({ rating: "desc"})
                                            .populate({
                                                path:"user",
                                                select:"firstName LastName email image",
                                            })
                                            .populate({
                                                path:"course",
                                                select:"courseName",
                                            })
                                            .exec();

                                            return res.status(200).json({
                                                success:true,
                                                message:"All reviews fetched successfully",
                                                data:allReviews,
                                            });
                                              
                                                                
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}