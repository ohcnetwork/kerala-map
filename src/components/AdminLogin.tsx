import React,{useState} from 'react'
import {User} from 'react-feather'

const AdminLogin = ({dark,handleClose}) => {
    const [userName,setUserName] = useState("")
    const [pass,setPass] = useState("")

    const handleChange = (evt) => {
        switch (evt.target.id) {
            case "username":
                setUserName(evt.target.value)
                break;
            case "password":
                setPass(evt.target.value)
                break;
            default:
                break;
        }
    }

    const handleSubmission = () =>{
        console.log(userName,pass)
        // apply admin thing to localstorage
        //localstorage key:admin
    }

    return (
        <div className={`${dark?"bg-black text-white":"bg-white text-black"} bg-opacity-50 rounded-lg overflow-hidden shadow-xl transform transition-all sm:m-2 sm:max-w-lg sm:w-full absolute z-10 inset-x-0 bottom-0`} role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className="p-2 sm:pb-0">
                <div className="sm:flex sm:items-start w-full">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-sm leading-6 font-medium" id="modal-headline">
                        ADMIN LOGIN
                    </h3>
                    <div className="mt-2">
                        <form>
                            <div className="mb-4">
                                <label className="block text-mobile mb-2" htmlFor="username">
                                    USERNAME
                                </label>
                                <input className="shadow appearance-none border rounded w-full p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="username"
                                value={userName} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="block text-mobile mb-2" htmlFor="password">
                                    PASSWORD
                                </label>
                                <input className="shadow appearance-none border rounded w-full p-2 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************"
                                value={pass} onChange={handleChange}/>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-2 sm:flex sm:flex-row-reverse">
                <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                    <button type="button" className={`${dark?"border-white":"border-black"} inline-flex justify-center w-full rounded-md border px-2 py-1 text-base leading-6 font-medium shadow-sm hover:text-gray-700 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5`}
                    onClick={handleSubmission}>
                        Login
                    </button>
                </span>
                <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                    <button type="button" className="inline-flex justify-center w-full rounded-md px-2 py-1 text-base leading-6 font-medium shadow-sm hover:text-gray-500 focus:outline-none transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                    onClick={handleClose}>
                    Cancel
                    </button>
                </span>
            </div>
        </div>
    )
}

export default AdminLogin
