import React, {useEffect, useState} from 'react'

const RequirementField = ({name,label,register, errors, setValue, getValues}) => {
 
    const[requirement, setRequirement] = useState("");
    const[requirementList, setRequirementList] =useState([]);

    useEffect(() => {
          register(name, {
            required:true,
          })
    },[])

    useEffect(() => {
        setValue(name, requirementList)
    },[requirementList])

    const handleAddRequirement = () => {
         if(requirement){
            setRequirementList([...requirementList, requirement]);
         }
    }

    const handleRemoveRequirement = (index) => {
        const updatedRequirementList = [...requirementList];
        updatedRequirementList.splice(index,1)
        setRequirementList(updatedRequirementList);
    }

  return (
       <div className="flex flex-col space-y-2">
        
            <label className="text-sm text-richblack-5" htmlFor={name}>
            {label} <sup className="text-pink-200">*</sup>
            </label>
            <div className="flex flex-col items-start space-y-2">
            <input
                type='text'
                id={name}
                value={requirement}
                placeholder='Enter Requirements'
                onChange={(e) => setRequirement(e.target.value)}
                className='w-full form-style'
            />
            <button
            type= 'button'
            onClick={handleAddRequirement}
            className='font-semibold text-yellow-50'
            >
                Add
            </button>
        </div>

        {

            requirementList.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                    {
                        requirementList.map((requirement,index) => (
                            <li key={index} className='flex items-center text-richblack-5'>
                                <span>{requirement}</span>
                                <button
                                 type='button'
                                 onClick={() => handleRemoveRequirement(index)}
                                 className='text-xs text-pure-greys-300 ml-2'
                                >
                                    clear
                                </button>
                            </li>
                        ))
                    }
                </ul>
            ) }
            {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}

export default RequirementField 