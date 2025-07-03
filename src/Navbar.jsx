import React from 'react'
import { Link} from 'react-router-dom'

function Navbar() {
  return (
    <nav className=" top-0  w-full bg-white shadow-md ">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-3xl font-extrabold text-purple-600">
          Appointment Booking
        </div>
        <ul className="flex space-x-6">
          <li className="text-lg font-semibold text-purple-600 hover:text-purple-800 transition duration-300 cursor-pointer">
             <Link to="/" className="hover:underline">Home</Link>
          </li>
          <li className="text-lg font-semibold text-purple-600 hover:text-purple-800 transition duration-300 cursor-pointer">
            <Link to="/add" className="hover:underline">Add</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
