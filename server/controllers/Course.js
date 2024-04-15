const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const {uploadImageToCloudinary} = require("../utils/ImageUploader");
const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Create Course ka Handler function

exports.createCourse = async (req,res) => {
    try{
        //Get userID from request object
        const userId = req.user.id;
       //console.log("userid read")
     //fetch data from request for creating course
     let{
         courseName,
         courseDescription,
         whatwillyoulearn, 
          price, 
          category,
          status,
          instructions: _instructions,
          tag: _tag,
        } = req.body;
      //console.log("otherdetails read")

      //console.log(courseName ," , ",courseDescription," , ",whatwillyoulearn," , ", price, " ,", status," , ", category," , ")
     //get Thumbnail
const Thumbnail = req.files.thumbnailImage;
 //console.log("Thumbnailread")
     
//convert the tag and instructions from stringified Array to Array
const tag = JSON.parse(_tag)
const instructions = JSON.parse(_instructions)

//console.log("tag ",tag)
//console.log("instructions ",instructions)

     // validation
     if(!courseName || 
        !courseDescription ||
         !whatwillyoulearn || 
         !price ||
          !category ||
           !Thumbnail  ||
           !tag.length ||
           !instructions.length
         ) {
        return res.status(401).json({
            success:false,
            message:"All fields are mandatory",
        });
     }

    
     if(!status || status === undefined){
        status = "Draft";
     }

    //check if user is an instructor
    
     const InstructorDetails = await User.findById(userId, {
        accountType: "Instructor",
     });
     
     // TODO: Verify that userID and instructorDetails._id are same or different ???????????????????

     if(!InstructorDetails){
        return res.status(404).json({
            success:false,
            message:'Instructor Details not found',
        });
    }

    // Check given Category is valid or not
    const CategoryDetails = await Category.findById(category);
    if(!CategoryDetails){
        return res.status(404).json({
            success:false,
            message:'Category entered by you is not found',
        });
    }
 
  
    //Upload Image in Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(Thumbnail, process.env.FOLDER_NAME);
    //console.log("thumbnailimage assigned")
    //Create the course entry in Database
    const newCourse = await Course.create({
        courseName: courseName,
        courseDescription: courseDescription,
        instructor: InstructorDetails._id,
        whatwillyoulearn: whatwillyoulearn,
        price:price,
        thumbnail:thumbnailImage.secure_url,
        category:CategoryDetails._id,
        status:status,
        instructions: instructions,
        tag:tag,
    });
  //After creating course only you will get id for that corse and safter that update everywhere
    //add the new course to instructor Schema
    await User.findByIdAndUpdate(
        {_id: InstructorDetails._id},
        {
            $push: {
                courses: newCourse._id,
            },
        },
        {new:true}
    );

    //Update Category Schema with the newly created course
    await Category.findByIdAndUpdate(
        {_id: CategoryDetails._id},
        {
            $push: {
                course:newCourse._id,
            },
        },
        {new:true}
    );

    //return response
    return res.status(200).json({
    success:true,
    data:newCourse,
    message:"Course Created Successfully",
      });
     }
      catch(error){
        console.log(error);
        return res.status(501).json({
            success:true,
            message: "Failed to create course",
			      error: error.message,
        })
    }
};

//Get all courses ka  controller

exports.getAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally using populate
            const allCourses = await Course.find({},
                {
                    courseName:true,
                    price:true,
                    thumbnail:true,
                    instructor:true,
                    ratingandReviews:true,
                    studentsEnrolled:true,
                })
                .populate("instructor")
                .exec();
                

            return res.status(200).json({
                success:true,
                message:'Data for all courses in the website fetched successfully',
                data:allCourses,
            })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}

//GetCourseDetails  for the specified course but in detail, fill all object ids with related data
exports.getCourseDetails = async (req,res) => {
    try{
        //fetch courseid
        const {courseId} = req.body;
        //get the details of the course
        const courseDetails = await Course.findOne(
            {_id:courseId})
            .populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionalDetails",
                    },

                }
            )
            .populate("category")
            .populate("ratingandReviews")
            .populate(
                {
                     path:"courseContent",
                      populate: {
                        path:"subSection",
                        select: "-videoUrl",
                     },
                })
            .exec();

            //Validation
            if(!courseDetails){
                return res.status(401).json({
                    success:false,
                    message:`Could not find the course with ${courseId}`
                });
            }

            
            let totalDurationInSeconds = 0
           
            courseDetails.courseContent.map((content) => {
              content.subSection.map((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
              })
            })
        
            const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

            //return response
            return res.status(200).json({
                success:true,
                message:"Course Details fetched successfully",
                data:{
                  courseDetails,
                  totalDuration,
                },
            });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//get full course details
exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingandReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      //console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

//Edit Course Details
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        //console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingandReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

//Delete a course
exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }

//Get instructor courses
//Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
