// Functions are written
import {toast} from "react-hot-toast"
import { apiConnector } from "../apiconnector"
import { endpoints } from "../apis"
import { setLoading, setToken } from "../../slices/authSlice"
import {setUser} from "../../slices/profileSlice"
import { resetcart } from "../../slices/cartSlice"
//DESTRUCTURING
const {
    SENDOTP_API,
    LOGIN_API,
    SIGNUP_API,
    RESETPASSWORDTOKEN_API,
    RESETPASSWORD_API,
} = endpoints

export function sendOtp(email, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try{
       const response = await apiConnector("POST", SENDOTP_API, {
           email,
           checkUserPresent: true,
       })
       console.log("SENDOTP API RESPONSE..........", response)

       console.log(response.data.success)

       if(!response.data.success){
        throw new Error(response.data.message)
       }

       toast.success("OTP Sent Successfully")
       navigate("/verify-email")
        }catch(error){
            console.log("SENDOTP API ERROR........", error)
            toast.error("Could Not Sent OTP")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}



export function login(email,password,navigate){
  return async (dispatch) => {
    const toastId = toast.loading("Loading....")
    dispatch(setLoading(true))
    try{
      console.log("authAPI ",email,password);
    const response = await apiConnector("POST",LOGIN_API, {
        email,
        password,
    })
  //response is backend response
    console.log("LOGIN API RESPONSE...........",response)
 
    if(!response.data.success){
        throw new Error(response.data.message) 
    }

    toast.success("Login Successful")
    dispatch(setToken(response.data.token))
    const userImage = response.data?.user?.image
    ? response.data.user.image
    : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
    
    dispatch(setUser({...response.data.user, image: userImage}))
    
    localStorage.setItem("token", JSON.stringify(response.data.token))
    navigate("/dashboard/my-profile")

    }catch(error){
        console.log("LOGIN API ERROR............", error)
        toast.error("Login Failed")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}





export function signUp(
    accountType,
    firstName,
    LastName,
    email,
    password,
    confirmPassword,
    otp,
    navigate
) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try{
            const response = await apiConnector("POST", SIGNUP_API, {
                accountType,
                firstName,
                LastName,
                email,
                password,
                confirmPassword,
                otp,
            })

            console.log("SIGNUP API RESPONSE........", response)

            if(!response.data.success){
                throw new Error(response.data.message)
            }
           toast.success("Signup Successful")
           navigate("/login")

        }catch(error){
            console.log("SIGNUP API ERROR............", error)
      toast.error("Signup Failed")
      navigate("/signup")
        }
        dispatch(setLoading(false))
    toast.dismiss(toastId)
    }
}




 export function logout(navigate){
    return(dispatch) => {
        dispatch(setToken(null))
        dispatch(setUser(null))
        dispatch(resetcart())
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        toast.success("Logged Out")
        navigate("/")
    }
 }

 export function getPasswordResetToken(email, setEmailSent) {
    return async(dispatch) => {
        dispatch(setLoading(true));
        try{
       const response = await apiConnector("POST", RESETPASSWORDTOKEN_API, {email})

       console.log("RESET PASSWORD TOKEN RESPONSE........", response)

       if(!response.data.success){
        throw new Error(response.data.message);
       }
       toast.success("Reset Email Sent")
       setEmailSent(true);
        }
        catch(error){
       console.log("RESET PASSWORD TOKEN Error", error);
       toast.error("Failed to send email for resetting password");
 }
 dispatch(setLoading(false));
}
 }

 export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    console.log(token)
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Password Reset Successfully")
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error("Failed To Reset Password")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}
