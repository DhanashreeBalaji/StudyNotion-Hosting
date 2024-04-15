const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req,res,next) => {
    try{
         //extract the token from the request to further authenticate the user further...
         const token =   req.cookies.token
                      || req.body.token
                      || req.header("Authorization").replace("Bearer ", "");

        //if token is missing return error message, no authentication without token
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        //verify the token to get the values from inside token
        try{
         const decode = jwt.verify(token, process.env.JWT_SECRET);
         req.user = decode ;
        }
        catch(err){
            return res.status(401).json({
                success:false,
                message:'Token is invalid',
            });
        }
        next();
        //After finish performing this middleware, the control should go to next one.

    }
    catch(error){
    return res.status(401).json({
        success:false,
        message:'Something went wrong while validating the token',
    });
    }
}

//Is student
  exports.isStudent = async (req,res,next) => {
    try{
      if(req.user.accountType !== "Student"){
        return res.status(401).json({
            success:false,
            message:'This is a Protected Route for Students only',
        });
      }
      next();
      //After this authentication go to next
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again',
      });
    }
  }




//Instructor
exports.isInstructor = async (req,res,next) => {
    try{
      if(req.user.accountType !== "Instructor"){
        return res.status(401).json({
            success:false,
            message:'This is a Protected Route for Instructors only',
        });
      }
      next();
      //After this authentication go to next
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again',
      });
    }
  }

//Admin

exports.isAdmin = async (req,res,next) => {
    try{
      if(req.user.accountType !== "Admin"){
        return res.status(401).json({
            success:false,
            message:'This is a Protected Route for Admins only',
        });
      }
      next();
      //After this authentication go to next
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again',
      });
    }
  }