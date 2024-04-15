const Category = require ("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
//create category ka handler function 

exports.createCategory = async(req,res)=> {
    try{
   //fetch the data from req body
   const {name,desc} = req.body;
   //Validate the fetched data
   if(!name || !desc){
    return res.status(401).json({
        success:false,
        message:"All fields are required",
    });
   } 
   //Create the new category ka entry in db 
   const Categorydetails = await Category.create({
              name:name,
              description:desc,
   });
  //console.log(Categorydetails);
  //return response
  return res.status(200).json({
    success:true,
    message:"Category Created Successfully",
})
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:error.message,
        })
    }
}

//Display all the Categories name and description
exports.showAllCategories = async (req,res) => {
   try{
    const allCategory = await Category.find()
     res.status(200).json({
        success:true,
        message:"All Categories returned successfully",
        data:allCategory,
    })
   }
   catch(error){
    return res.status(401).json({
        success:false,
        message:error.message,
    })
   }
}

//CategoryPageDetails  #Python Category
exports.categoryPageDetails = async (req,res) => {
    try{
        //get category Id
        const {categoryId} = req.body;
        //console.log("Categoryid ",categoryId)
        //get courses for the specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                        .populate({
                                            path:"course",
                                            match: {status : "Published"},
                                            populate: "ratingandReviews",
                                        })
                                        .exec();  
  //console.log("SELECTED COURSE", selectedCategory)
        //Handle the case where category is not found
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Category Not Found',
                });
            }

      //Handle the case when there are no courses for the category
      if(selectedCategory.course.length === 0){
        //console.log("No courses found for the selected category")
        return res.status(404).json({
            success:false,
            message:" No courses found for the selected category.",
        })
      }

            // ----------------------Get courses for other categories--------------------------------------
    const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      //console.log("categoriesExceptSelected", categoriesExceptSelected)

     
        let differentCategory = await Category.findOne(
          categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
          .populate({
            path: "course",
            match: { status: "Published" },
          })
          .exec()
        //console.log("Different category",differentCategory)
      
          

      // -------------------------Get top-selling courses across all categories---------------------
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
  
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })


    }catch(error) {
            //console.log(error);
            return res.status(500).json({
                success:false,
                message:"Internal Server error",
                error:error.message,
            });
        }
    }
