import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer } from "react-icons/rx";
import { sendOtp, signUp } from "../services/operations/authAPI";
import { useState, useEffect } from "react";





function VerifyEmail() {
const [otp,setOtp] = useState("");
const {signupData, loading} = useSelector((state) => state.auth);
const dispatch = useDispatch();
const navigate = useNavigate();

//Only allow access to the verify email route when user has filled the sign up form fully
    //To make sure of that check the signupData variable from auth Slice
    //The signupData variable is set when we fill the sign up form and submit it.
    //We can use those details in other places.
    //If no detail in signupData then otp cannot be send means why to render this page
    //This page is valid only if you enter all details in signup form so that a mail is send with the OTP
    // and all the details entered in the signup form will be saved in signupData variable
useEffect(() => {
    if(!signupData){
        navigate("/signup");
    }
   
}, []);

const handleVerifyAndSignup = (e) => {
    e.preventDefault();
    const {
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
    } = signupData;

    dispatch(
   signUp(
    accountType,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    otp,
    navigate
   )
    );
};

return(
 <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center">
    {loading ? (
        <div>Loading....</div>
    ) : (
        <div>
            <h1 className="text-richblack-5 font-semibold text-[1.875rem] leading-[2.375rem]">
                Verify Email
            </h1>
            <p className="text-[1.125rem] leading-[1.625rem] my-4 text-richblack-100">
                A verification code has been sent to you. Enter the code below
            </p>
            <form onSubmit={handleVerifyAndSignup}>
                <OtpInput
                 value = {otp}
                 onChange={setOtp}
                 numInputs={6}
                 renderInput={(props) => (
                <input
                  {...props}
                  placeholder="-"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-[48px] lg:w-[60px] border-0 bg-richblack-800 rounded-[0.5rem] text-richblack-5 aspect-square text-center focus:border-0 focus:outline-2 focus:outline-yellow-50"
                />
                )}
                containerStyle={{
                justifyContent: "space-between",
                gap: "0 6px",
              }}
               />
            <button
            type="submit"
            className="w-full bg-yellow-50 py-[12px] px-[12px] rounded-[8px] mt-6 font-medium text-richblack-900"
            >
            Verify Email
         </button>
            </form>
            <div className="mt-6 flex items-center justify-between">
                <Link to="/signup">
                    <p className="text-richblack-5 flex items-center gap-x-2">
                        <BiArrowBack/> Back To Signup
                    </p>
                </Link>
                <button
                className="flex items-center text-blue-100 gap-x-2"
                onClick={() => dispatch(sendOtp(signupData.email))}
                >
                    <RxCountdownTimer/>
                    Resend it
                </button>
            </div>
        </div>
    )
    
    }
 </div>
)


}

export default VerifyEmail