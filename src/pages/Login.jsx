import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"

function Login() {
    return(
        <Template
            title="Welcome Back"
            description1="Bulid skills for today, tomorrow, and beyond"
            description2="Education to future-proof your career"
            image={loginImg}
            formType="login"
        />
    )
}

export default Login