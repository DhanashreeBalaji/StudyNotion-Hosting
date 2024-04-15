const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
//Create a new  Section Controller
exports.createSection = async (req,res) => {
    try{
        //fetch data of section
        const {sectionName, courseId} = req.body;

        //Validation of entered input
        if(!sectionName || !courseId){
            return res.status(401).json({
                success:false,
                message:"Missing Required Properties",
            });
        }
        //create new section
        const newSection = await Section.create({ sectionName });

        //update the course schema that is related with new section id
        const updatedCourseDetails = await Course.findByIdAndUpdate(
               courseId,
               {
                $push: {
                    courseContent:newSection._id,
                 }
               },
               {new:true},
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully ",
           updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        });
    }
}

//Update Section

exports.updateSection = async (req,res) =>{
    try{
 //fetch the data to update
 const { sectionName,sectionId,courseId } = req.body;
 
 //validate
 if(!sectionId || !sectionName){
    return req.status(401).json({
        success:true,
        message:"Enter all the details completely",
    })
 }

 //update section with new details
 const updatedSection = await Section.findByIdAndUpdate(
         sectionId, 
         {sectionName},
         {new:true}
     );

     const course = await Course.findById(courseId)
                                .populate({
                                    path:"courseContent",
                                    populate:{
                                        path:"subSection"
                                    }
                                })
                                .exec();


 //return response
  res.status(200).json({
    success:true,
    message:"Section updated successfully",
    message: updatedSection,
    data: course
 });
    }
    catch(error){
        console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
    }
}

//Delete a Section
exports.deleteSection = async (req,res) => {
    try{
          const { sectionId,courseId } = req.body;
          
          
          
          await Course.findByIdAndUpdate( courseId, {
            $pull: {
                courseContent: sectionId,
            }
          })

         const section = await Section.findById(sectionId);
         if(!section) {
            return res.status(404).json({
                success:false,
                message:"Section not Found",
            })
         }
          
         //doubt
         await SubSection.deleteMany({_id: {$in: section.subSection}})

         await Section.findByIdAndDelete(sectionId);

         //find the updated course after deleting the section and return it
         const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate: {
                path: "subSection"
            }
         })
         .exec();

         res.status(200).json({
            success:true,
            message:"Section deleted",
            data:course
         });
    }

    catch(error){
        console.error("Error deleting section:", error);
        res.status(500).json({
            success:false,
            message: "Internal server error",
        });
    }
};