import React, { useEffect, useState } from 'react'
import {useForm} from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux';
import IconBtn from "../../../../common/IconBtn"
import { toast } from 'react-hot-toast';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';

import RequirementField from "./RequirementField"
import { setStep, setCourse } from '../../../../../slices/courseSlice';
import { COURSE_STATUS } from '../../../../../utils/constants';
import { fetchCourseCategories,addCourseDetails, editCourseDetails } from '../../../../../services/operations/courseDetailsAPI';
import ChipInput from "./ChipInput"
import Upload from "../Upload"
import { MdNavigateNext } from "react-icons/md"



const CourseInformationForm = () => {


  const {
      register,
      handleSubmit,
      setValue,
      getValues,
      formState:{errors},     
  } = useForm();
  
  const dispatch = useDispatch()
  const {token} = useSelector((state)=>state.auth)
  const {course, editCourse} = useSelector((state)=>state.course)
  const [loading, setLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])
   
  useEffect(() => {
    const getCategories = async () => {
        setLoading(true)
        const categories = await fetchCourseCategories()
        if (categories.length > 0) {
           console.log("categories", categories)
          setCourseCategories(categories)
        }
        setLoading(false)
      }

      if(editCourse){
          
        setValue("courseTitle",course.courseName);
        setValue("courseShortDesc",course.courseDescription);
        setValue("coursePrice",course.price);
        setValue("courseTags",course.tag);
        setValue("coursebenefits",course.whatwillyoulearn);
        setValue("courseCategory",course.category);
        setValue("courseImage",course.thumbnail);
        setValue("courseRequirements",course.instructions);
      }
      getCategories()
  },[])


  const isFormUpdated = () => {
  const currentValues = getValues();
  if( currentValues.courseTitle !== course.courseName ||
    currentValues.courseShortDesc !== course.courseDescription ||
    currentValues.coursePrice !== course.price ||
    currentValues.courseTags.toString() !== course.tag.toString() ||
    currentValues.coursebenefits !== course.whatwillyoulearn ||
    currentValues.courseCategory._id !== course.category._id ||
    currentValues.courseImage !== course.thumbnail ||
    currentValues.courseRequirements.toString() !== course.instructions.toString()

  ) return true;
  else
  return false;
  }

  //handles next/save changes button click
  const onSubmit = async(data) => {

    if(editCourse) {
       if(isFormUpdated()){
        const currentValues = getValues();
        const formData = new FormData();
         
        // Add the current course id on which editing is done in formdata
        formData.append("courseId",course._id);

        // Append that formvalues in formData for which changes are done
        if(currentValues.courseTitle !== course.courseName){
            formData.append("courseName", data.courseTitle)
        }

        if(currentValues.courseShortDesc !== course.courseDescription){
            formData.append("courseDescription", data.courseShortDesc)
        }

        if(currentValues.coursePrice !== course.price){
            formData.append("price", data.coursePrice)
        }

        if(currentValues.coursebenefits !== course.whatwillyoulearn){
            formData.append("whatwillyoulearn", data.coursebenefits)
        }

        if(currentValues.courseCategory._id !== course.category._id){
            formData.append("category", data.courseCategory)
        }

        

        if(currentValues.courseRequirements.toString() !== course.instructions.toString()){
            formData.append("instructions", JSON.stringify(data.courseRequirements))
        }

        setLoading(true);
        const result = await editCourseDetails(formData,token);
        setLoading(false);
         if(result){
            setStep(2);
            dispatch(setCourse(result));
         }
       }
     else{
        toast.error("No changes made so far")
     }
     
    }

    //create a new course
      const formData = new FormData();
      formData.append("courseName",data.courseTitle);
      formData.append("courseDescription",data.courseShortDesc)
      formData.append("price",data.coursePrice)
      formData.append("whatwillyoulearn",data.coursebenefits)
      formData.append("category", data.courseCategory);
      formData.append("instructions", JSON.stringify(data.courseRequirements));
      formData.append("status", COURSE_STATUS.DRAFT);
      formData.append("tag", JSON.stringify(data.courseTags))
      formData.append("thumbnailImage", data.courseImage)
      setLoading(true);
      const result = await addCourseDetails(formData,token)
      if(result){
        dispatch(setStep(2));
        dispatch(setCourse(result));
      }     
      setLoading(false);
    
    }

  return (
    <form
    onSubmit={handleSubmit(onSubmit)}
    className='space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6'>

<div className="flex flex-col space-y-2">
    <label className="text-sm text-richblack-5" htmlFor='courseTitle'>Course Title<sup className="text-pink-200">*</sup></label>
    <input
        id='courseTitle'
        placeholder='Enter Course Title'
        {...register("courseTitle", {required:true})}
        className=' form-style w-full'
        
    />

    {
        errors.courseTitle && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Title is Required
            </span>
        )
    }
</div>
{/* Course Short Description */}
<div className="flex flex-col space-y-2">
    <label className="text-sm text-richblack-5"  htmlFor='courseShortDesc'>Course Short Description<sup>*</sup></label>
    <input
        id='courseShortDesc'
        placeholder='Enter Course Description'
        {...register("courseShortDesc", {required:true})}
        className='className="form-style resize-x-none min-h-[130px] w-full"'
        
    />

    {
        errors.courseShortDesc && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Description is Required**
            </span>
        )
    }
</div>

<div className='flex flex-col space-y-2'>
    <label className="text-sm text-richblack-5" htmlFor='coursePrice'>Course Price<sup>*</sup></label>
    <div className='relative'>
    <input
        id='coursePrice'
        placeholder='Enter Course Price'
        {...register("coursePrice", {
            required:true,
            valueAsNumber:true
            })}
        className="form-style w-full !pl-12"
        
    />
 <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-richblack-400" />
    </div>
    {
        errors.coursePrice && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Price is Required**
            </span>
        )
    }
</div>

{/* Course Category */}

<div className="flex flex-col space-y-2">
    <label className="text-sm text-richblack-5"  htmlFor='courseCategory'>Course Category<sup>*</sup></label>
    
    <select
     id='courseCategory'
     defaultValue=""
     {...register("courseCategory", {required:true})}
     className="form-style w-full"
    >
   <option value="" disabled>
  Choose a Category
   </option>
   
   {!loading && 
      courseCategories?.map((category, index) => (
        <option key={index} value={category?._id}>
            {category?.name}
        </option>
      ))}

    </select>

    {
        errors.courseCategory && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
                Course Category is Required**
            </span>
        )
    }
</div>

{/* TAGS */}
{/* CREATE A CUSTOM COMPONENT FOR HANDLING TAGS INPUT */}
 <ChipInput
    label="Tags"
    name="courseTags"
    placeholder="Enter Tags and press Enter"
    register={register}
    errors={errors}
    setValue={setValue}
    getValues={getValues}
 />
    

{/* CREATE A COMPONENT FOR UPLOADING the thumbnail i.e., cover photo of the course */}
 <Upload
    name="courseImage"
    label="Course Thumbnail"
    register={register}
    setValue={setValue}
    errors={errors}
    editData={editCourse ? course?.thumbnail : null}
 />


 {/* Benefits of the course */}
  <div className="flex flex-col space-y-2">
    <label className="text-sm text-richblack-5">Benefits of the Course <sup>*</sup></label>
    <textarea
        id='coursebenefits'
        placeholder='Enter benefits of the course'
        {...register("coursebenefits", {required:true})}
        className="form-style resize-x-none min-h-[130px] w-full"
    />
    {
        errors.coursebenefits && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
                    Benefits of the course are required**
                </span>
        )
    }
  </div>

  <RequirementField
    name="courseRequirements"
    label="Requirements/Instructions"
    register={register}
    errors={errors}
    setValue={setValue}
    getValues={getValues}
  />

  <div className="flex justify-end gap-x-2">
    {
        editCourse && (
            <button
              onClick={() => dispatch(setStep(2))}
              className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
            >
                Continue Without Saving
            </button>
        )
    }
    <IconBtn
          disabled={loading}
          text={!editCourse ? "Next" : "Save Changes"}
        >
          <MdNavigateNext />
        </IconBtn>

  </div>

    </form>
  )
}

export default CourseInformationForm