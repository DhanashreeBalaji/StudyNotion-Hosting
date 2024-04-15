const express = require("express");
const router = express.Router();
//Import the Controllers
//Course Controllers Import

const{                                                                                                                                                                                                                                                                                      
    createCourse,
    getAllCourses,
    getCourseDetails,
     getFullCourseDetails,
     editCourse,
     getInstructorCourses,
     deleteCourse,
} = require("../controllers/Course");

//Categories Controllers Import
const{
    showAllCategories,
    createCategory,
    categoryPageDetails,
} = require("../controllers/Category");

//Sections Controller Import
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

//Subsections Controllers
const{
    createSubsection,
    updatesubSection,
    deletesubSection,
} = require("../controllers/Subsection");

//Rating Courses Controller Import
const{
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controllers/RatingandReview");

const {
    updateCourseProgress,
    getProgressPercentage,
  } = require("../controllers/courseProgress")

//Importing Middlewares
const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth");




//Courses can only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
//Add a Section to a Course
router.post("/addSection",auth,isInstructor,createSection);
//Update a Section
router.post("/updateSection",auth,isInstructor,updateSection);
//Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
//Add a Subsection to a section
router.post("/addSubSection",auth, isInstructor, createSubsection);
//Edit a Subsection
router.post("/updateSubsection", auth, isInstructor, updatesubSection);
//Delete a Subsection
router. post("/deletesubSection", auth, isInstructor, deletesubSection);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
//Get all Registered Courses
router.get("/getAllCourses",getAllCourses);
//Get Details for a Specific Course
router.post("/getCourseDetails", getCourseDetails);
// Delete a Course
router.delete("/deleteCourse", deleteCourse)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// To get Course Progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)


// ***********************************************************************
//                           Category Routes(only for Admin)
// ***********************************************************************
//Category can only be created by Admin

//Create a Category
router.post("/createCategory", auth, isAdmin, createCategory);
//Show All Categories Present
router.get("/showALLCategories", showAllCategories);
//Get details about a  category and also other reccomendations of  categories as options
router.post("/getCategoryPageDetails", categoryPageDetails);


// *************************************************************
//                          Rating and Review
//******************************************************************

//Do post a new Rating
router.post("/createRating", auth, isStudent, createRating);
//Get the Rating for a particular Course
router.get("/getAverageRating", getAverageRating);
//get the ratings and Reviews of all users for all courses(get all the entries from Rating and Review Collection in database)
router.get("/getReviews",getAllRating);

module.exports = router;
