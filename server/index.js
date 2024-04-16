const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");


const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 4000;

const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");

//Cloudinary Connect
cloudinaryConnect();

//Database Connect
database.connect();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin:"*",
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

//routes mounting
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);


//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....',
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`);
})


//Course Controllers-- > Get a course Detail-> .populate("category") -> its working but the result is confusing, check and verify  the result 


