const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//Reset password Token
 exports.resetPasswordToken = async (req,res) =>{
    try{
        //You forgot your own password, now you have only email with you as a input information
 //Get email from request
 const {email} = req.body;

 //Check if registered user or not
 const user = await User.find({email});
 if(!user){
    return res.status(401).json({
        success:false,
        message:"User not registered",
    })
 }

 //generate token 
 const token  = crypto.randomBytes(20).toString("hex");

 //Update and save the token with the expiration time in User model of the corresponding email id entry in database.
 const updatedDetails = await User.findOneAndUpdate(
     {email:email},
     {
         token:token,
         resetPasswordExpires: Date.now() + 5*60*1000,
     },
     {new:true}
               );
                   //console.log("DETAILS",updatedDetails);
            
     //Create URL WITH the token
     const url = `http://localhost:3000/update-password/${token}`;

     //send mail  WITH THE LINK which resets the password,
     //When clicked on the link , it will take you to a frontend page where you enter the new passwords
     await mailSender(email,
         "Password Reset Link",
        `Password Reset Link: ${url}`)

        //return response
 return res.json({
     success:true,
     message:'Email sent successfully, please check email and change password',
 });
      
    }
    catch(error){
        return res.json({
            success:true,
            message:'Something went wrong while sending reset password email. Please try again. ',
        });
    }
 }



//Reset Password
exports.resetPassword = async (req,res) => {
   try{
    //console.log("Reached backend")
    //fetch data from request
     const {password,confirmPassword,token} =req.body;
     //validation
     if(password !== confirmPassword){
        return res.status(401).json({
            success:false,
            message:"Password and Confirm Password dont match",
     });
     }
     
     //Get UserDetails from DB using Token
     const userDetails = await User.findOne({token:token});
     if(!userDetails){
        return res.status(401).json({
            success:false,
            message:"Token is invalid. Try again. ",
        })
     }
    //Now we understood there is a user for this token

     //Check expiration time of token
     if( !(userDetails.resetPasswordExpires > Date.now()) ) {
        return res.json({
            success:false,
            message:'Token is expired, please regenerate your token',
        });
}

  //Hash the new password
  const hashedpassword = await bcrypt.hash(password,10);
 
  //Password update in DB
  await User.findOneAndUpdate(
         {token:token},
         {password:hashedpassword},
         {new:true},
  )

  return res.status(200).json({
    success:true,
    message:'Password reset successful',
     });   


   }
   catch(error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'Something went wrong while updating the new password.Please Try again.'
    })
}
}
