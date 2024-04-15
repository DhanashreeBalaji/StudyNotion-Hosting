const Profile = require("../models/Profile");
const {uploadImageToCloudinary} = require("../utils/ImageUploader");
const User = require("../models/User");
const Course = require("../models/Course")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/CourseProgress")

//Update Details in Profile of the registered User
exports.updateProfile = async (req,res) => {
    try{
        //fetch the data
        const{
        firstName = "",
        LastName="",
        dateOfBirth="",
        about="",
        contactNumber="",
        gender="",
        } = req.body;
 
        //get userid of the current  user
        const userId = req.user.id;
        
        //get the profile id associated with the user
        const userDetails = await User.findById(userId);
        const profile = await Profile.findById(userDetails.additionalDetails)

        const user = await User.findByIdAndUpdate(userId, {
            firstName,
            LastName,
          })
          await user.save()

        //Update the Profile in DB
        //Object(ProfileDetails) is made, do the changes in object and use save() function and save the object

       // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
        
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

//Delete the Account Handler function
exports.deleteAccount = async(req,res) =>{
    try{
        // TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);

        //get id
        const id = req.user.id;
        //To check if this id exists
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }

        //delete the profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //TODO HW:Unenroll user from all enrolled courses

        //Now delete User
        await User.findByIdAndDelete(id);

    

         //return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });
 
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};

//Get all User Details
exports.getAllUserDetails = async(req,res) => {
 try{
    //get id of user
    const id = req.user.id;
    //Validation and get user details
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    //return response
    return res.status(200).json({
        success:true,
        message:'User Data Fetched Successfully',
        data:userDetails,
    });
 }
 catch(error) {
    return res.status(500).json({
        success:false,
        message:error.message,
    });
}
};

//Controller to Update Display Picture of user
exports.updateDisplayPicture = async (req,res) => {
    try{
  const displayPicture = req.files.displayPicture;
  const userId = req.user.id;
  const image = await uploadImageToCloudinary(
    displayPicture,
    process.env.FOLDER_NAME,
    1000,
    1000
  );
  // console.log(image);
  //Update Image in User SCHEMA
  const updatedProfile = await User.findByIdAndUpdate(
    {_id: userId}, 
    {image:image.secure_url},
    {new:true}
  )

  res.send({
    success:true,
    message:`Image Updated Succcessfully`,
    data:updatedProfile,
  });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
};

//Controller to get the enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  
  try {
    
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    
    userDetails = userDetails.toObject()
    // console.log("userdetails from mongodb ", userDetails.courses)

    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }


      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      //console.log("courseProgressCount ",courseProgressCount)
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    })
  }
}


 exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }
  
