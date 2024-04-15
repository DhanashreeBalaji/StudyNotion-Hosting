const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");


//Create Subsection for a section
exports.createSubsection = async (req,res) =>{
    try{
        //fetch datas to create subsection
        const{sectionId,title,description} = req.body;
       const video = req.files.video;

       //validation
       if(!sectionId || !title || !description || !video) {
        return res.status(404).json({
            success:false,
            message:'All fields are required',
        });
    }
    //Upload video of this subsection to cloudinary
    const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
    //console.log(uploadDetails);

    //CREATE the subsection
    const newsubsection = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //Update the related section with the new subsection id
    const updatedSection = await Section.findByIdAndUpdate(
        {_id:sectionId},
        {
            $push:{
            subSection:newsubsection._id,
        },
           },
        {new:true}).populate("subSection").exec();

      //console.log(updatedSection)
        //return updated section in response
        return res.status(200).json({
            success:true,
            message:"Subsection created successfully for the section",
            data:updatedSection,
        });
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        })
    }
}

//Update Subsection
exports.updatesubSection = async (req,res) =>{
    try{
 //fetch the data to update
 const{title,description,subSectionId,sectionId} = req.body;
  const subsection = await SubSection.findById(subSectionId);

 //validate
 if(!subsection){
    return req.status(401).json({
        success:true,
        message:"Subsection not found",
    })
 }

 if(title !== undefined){
    subsection.title = title;
 }

 if(description !== undefined){
    subsection.description = description;
 }

if(req.files && req.files.video !== undefined){
    const video = req.files.video;
 //Upload new video to cloudinary and get the secure url
 const videoDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
 
 subsection.videoUrl = videoDetails.secure_url;
 subsection.timeDuration = `${videoDetails.duration}`
}

//Save the new values in database using save function
 await subsection.save();

 //update subSection with new details
//  const updatedsubSection = await SubSection.findByIdAndUpdate(
//     {subSectionId}, 
//     {
//     title,
//     description,
//     timeduration,
//     videoUrl:videoDetails.secure_url}, 
//     {new:true});

//find updated section and return it
const updatedSection = await Section.findById(sectionId).populate(
    "subSection"
)
//console.log("updated section" , updatedSection);

 //return response
 return res.status(200).json({
    success:true,
    message:"subSection updated successfully",
    data: updatedSection,
 })
    }
    catch(error){
        console.error(error);
    return res.status(401).json({
        success:false,
        message:"An error occured while updating the section",
        error:error.message,
    })
    }
}


//delete Subsection

exports.deletesubSection = async (req,res) => {
    try{
        //fetch data
        const {subSectionId, sectionId} = req.body;

        if(!subSectionId || !sectionId){
            return res.status(401).json({
                success:false,
                message:"subection ID  cannot be found, Try again",
            })
        }
        
         //Delete the subsection id from its section list
            await Section.findByIdAndUpdate(
                {_id: sectionId},
                {
                    $pull: {
                        subSection:subSectionId,
                    },
                }
                
            );

        //delete the subsection entry
        const subsection =await SubSection.findByIdAndDelete({_id: subSectionId});

        if (!subsection) {
            return res
              .status(404)
              .json({ success: false, message: "SubSection not found" })
          }
       // find updated section and return it
       const updatedSection = await Section.findById(sectionId).populate(
       "subSection"
        )
        //return response
        return res.status(200).json({
            success:true,
            message:"SubSection Deleted Successfully",
            data:updatedSection,
        })
    }
        catch(error){
            console.error(error)
            return res.status(500).json({
                success:false,
                message:"Unable to delete SubSection, please try again",
                error:error.message,
            });
        }
    }
