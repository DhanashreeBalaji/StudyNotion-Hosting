import "./App.css";
import {Route, Routes, useNavigate} from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar"
import Signup from "./pages/Signup";
import OpenRoute from "./components/core/Auth/OpenRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword"
import VerifyEmail from "./pages/VerifyEmail"
import UpdatePassword from "./pages/UpdatePassword"
import About from "./pages/About"
import Contact from "./pages/Contact"
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard"
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Settings from "./components/core/Dashboard/Settings"
import { useDispatch , useSelector} from "react-redux";
import { useEffect } from "react"
import { ACCOUNT_TYPE } from "./utils/constants";
import Cart from "./components/core/Dashboard/Cart"
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses"
import Error from "./pages/Error"
import AddCourse from "./components/core/Dashboard/AddCourse";
import EditCourse from "./components/core/Dashboard/Edit course";
import Instructor from "./components/core/Dashboard/Instructor";
import MyCourses from "./components/core/Dashboard/MyCourses"
import CourseDetails from "./pages/CourseDetails"
import VideoDetails from "./components/core/ViewCourse/VideoDetails"
import Catalog from "./pages/Catalog"
import ViewCourse from "./pages/ViewCourse"
import { getUserDetails } from "./services/operations/profileAPI"
function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile)

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = JSON.parse(localStorage.getItem("token"))
      dispatch(getUserDetails(token, navigate))
    }
    
  }, [])

  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">

    <Navbar/>

      <Routes>
        <Route path="/" element={<Home/>} />
          {/* Open Route - for Only Non Logged in User */}
        <Route path="signup" element={
          <OpenRoute>
            <Signup/>
          </OpenRoute>
        }
        />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />

        <Route
          path="login"
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />

            <Route
              path="forgot-password"
              element={
                <OpenRoute>
                  <ForgotPassword/>
                </OpenRoute>
              }
            />
       
          <Route
            path="/verify-email"
            element={
              <OpenRoute>
                <VerifyEmail/>
              </OpenRoute>
            }
          />
     
       <Route
        path="update-password/:id"
        element={
          <OpenRoute>
           <UpdatePassword/>
          </OpenRoute>
        }    />

              

        <Route path="/about" element={ <About/> }/>

        <Route path="/contact" element={<Contact/>}/>

{/* Private Route - for Only Logged in User */}
       <Route 
       element={
        <PrivateRoute>
          <Dashboard/>
        </PrivateRoute>
       }
       >

     {/* Route for all users */}
        <Route path="dashboard/my-profile" element={<MyProfile/>} />
        <Route path="dashboard/Settings" element={<Settings />} />

{
  user?.accountType === ACCOUNT_TYPE.STUDENT && (
    <>
          <Route path="dashboard/cart" element={<Cart />} />
          <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
          <Route path="dashboard/settings" element={<Settings />} />
          </>
  )
}
   {
    user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
      <>
        <Route path="dashboard/instructor" element={<Instructor />} />
        <Route path="dashboard/add-course" element={<AddCourse/>}/>
        <Route path="dashboard/my-courses" element={<MyCourses/>}/>
        <Route path="dashboard/edit-course/:courseId" element={<EditCourse/>}/>

      </>
    )
   }
</Route>
 {/* For watching the course lectures */}
 
 <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
{user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>

{/* 404 Page */}
       <Route path="*" element={<Error />} />
      </Routes>

    </div>
  );
}

export default App;
