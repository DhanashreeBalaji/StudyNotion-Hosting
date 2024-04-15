const User = require ("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const mailsender = require("../utils/mailSender");


//Send OTP for email verification
exports.sendOTP = async (req,res) => {
    try{
        const {email} = req.body;
        //Check if user already registered
        //Find user with provided mailid
        const CheckUserPresent = await User.findOne({email});

        //If user found with provided email
        //If user already registered then no need to sign up, send response
        if(CheckUserPresent){
            return res.status(401).json({
                success:false,
                message:"User is already Registered. Please Login with your registered credentials"
            })
        }
        //Or else proceed to send otp
        //Generate OTP
        const otp = otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false,
        });
       //console.log("Generated OTP is: ", otp);

        //Check if created otp is unique or not, if a same one is present in database already
        const result = await OTP.findOne({otp:otp});

        while(result){
            const otp = otpGenerator.generate(6,{
                lowerCaseAlphabets:false,
                upperCaseAlphabets:false,
                specialChars:false,
            });
            const result = await OTP.findOne({otp:otp});
            }
      //console.log("OTP is unique");
      //Create an entry for OTP in database
      //While creating an entry in database for OTP, the OTP.js model includes email,otp,createdAt entries
      //But createdAt time have a default value so non need to include in otpPayload
      const otpPayload = {email,otp};
      const otpBody = await OTP.create(otpPayload);
      //console.log("otpBody: ",otpBody);

      //Return Successful Response
      return res.status(200).json({
        success:true,
        message:"OTP Generated Successfully",
        otp,
      });
    } catch(err){
        return res.status(401).json({
            success:false,
            message:"Error while generating OTP",
            error: err.message,
        })
    }
};

//SignUp controller

exports.signup = async (req,res) => {
    try{
        //data fetch from request, Destructure fields from request
        const{
            firstName,
            LastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        
      //Validate the input got from request
      if(
        !firstName || 
        !LastName || 
        !email || 
        !password || 
        !confirmPassword || 
        !otp
         ) {
        return res.status(401).json({
            success:false,
            message:"All Fields are required",
        })
     }
     // Check same passwords or not
 if(password !== confirmPassword){
    return res.status(401).json({
        success:false,
        message:"Password and Confirm Password do not match. Please Try Again",
    })
 }
//Have to verify if the entered OTP by user and the OTP Stored in Database while generated is same
  //Find the most recent OTP entry Of the user from the database for the given email

  const recentOTP = await OTP.find({ email }).sort({ createdAt:-1 }).limit(1);
  //console.log("RecentOTP fROM Database ",recentOTP);

  if(recentOTP.length === 0){
   return res.status(401).json({
       success:false,
       message:"OTP not found in DataBase. OTP Expired.",
       //No otp found in database, otps would have expired...
   });
  }
 else if(otp !== recentOTP[0].otp){
       return res.status(401).json({
           success:false,
           message:"Invalid OTP Entered. Please Enter the OTP Correctly. ",
       })
      }

      //Hash the input password
      const hashedPassword = await bcrypt.hash(password,10);

      //Create the  User
      let approved = "";
      approved === "Instructor" ? (approved = false) : (approved = true);

      //Create the additional profile Section/Entry for the same new user
      //and link that profile entry  with this user entry through profile_id
      const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth: null,
        about:null,
        contactNumber:null,
      })

      const user = await User.create({
        firstName,
        LastName,
        email,
        password:hashedPassword,
        contactNumber,
        accountType,
        additionalDetails:profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${LastName}`,
      })
      return res.status(200).json({
        success:true,
        message:'User is registered Successfully',
        user,
    });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again",
        });
    }
}

//Login
exports.login = async (req,res) => {
    try{
       //get data from request body
       const {email,password} = req.body;
       console.log("Backend",email,password);
       //validation data
       if(!email || !password){
        return res.status(401).json({
            success:false,
            message:"Please fill up all the required details",
        })
       }
       //Check User exists or not in database with the provided email from input request
       const user = await User.findOne({email});
       if(!user){
        return res.status(401).json({
            success:true,
			message: `User is not Registered with Us Please SignUp to Continue`,
        });
       }
       //Generate Web Token if password validated
       if(await bcrypt.compare(password,user.password)){
           
        const payload = {
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn:"24h",
            }
        );
            //Save token to user document in database
            //Put the Token and make password undefined in the user object that is got from DB Call.
            //This user is send as response to client in a cookie
            user.token = token;
            user.password = undefined;
              // So SERVER Created The Token which could be used for further authentication on multiple calls by client.

              //Set Cookie for Token and send Response to client
              const options = { 
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,  
              }
              res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
       }
       else{
        return res.status(401).json({
            success:false,
            message:'Password is incorrect',
        });
       }
        
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
    }

    //Change password controller
    exports.changePassword = async (req,res) => {
        try{
            //get data from req body
 const {oldPassword, newPassword} = req.body;
 //Check the input fields
    if(!oldPassword || !newPassword ){
        return res.status(401).json({
            success:true,
            message:"Enter all the fields",
        })
    }
    //Validations of passwords
  //Get the user details(while changing password user must have logged in.)
    const user = await User.findById(req.user.id);
    
    //Validate old password
    const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        user.password
    );
    if(!isPasswordMatch){
        return res.status(401).json({
            success:false,
            message:"The Password is incorrect",
        });
    }
   

   
        const hashedPassword = await bcrypt.hash(newPassword,10);
       
        const newentrydoc = await User.findByIdAndUpdate(
            req.user.id,
            {password:hashedPassword},
            {new:true}
        )
        

        //Send Notification Email for successful password update
        try{
      const emailResponse = await mailsender(
        newentrydoc.email,
        passwordUpdated(
            newentrydoc.email,
            `Password updated successfully for ${newentrydoc.firstName} ${newentrydoc.LastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse);

        } catch(error){
       //If there is any error in sending success mail for password update
        console.log("Error occured while sending email:",error);
        return res.status(500).json({
            success:false,
            message:"Error occured while sending mail",
            error:error.message,
        });
        }
        //Return success response
        return res.status(200).json({
            success:true,
            message:"Password Updated Successfully."
         });

    } catch(error){
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}