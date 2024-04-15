const mongoose = require("mongoose");
const mailSender = require ("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 60 * 5, // The document will automatically deleted after 5 minutes
    }
});

//A Function to send verification email for otp
async function sendVerificationEmail(email,otp){
    try{
    const mailResponse = await mailSender(
                                            email,
                                            "Verification Email from StudyNotion",
                                            emailTemplate(otp)
                                     );
  console.log("Email Sent Successfully: ", mailResponse);
    }
    catch(error){
        console.log("Error occured while sending mails: ",error);
        throw error;
    }
}

//PRE MIDDLEWARE FOR OTP...
OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})
//Export the OTP Model
module.exports = mongoose.model("OTP", OTPSchema);