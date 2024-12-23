"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import "./globals.css" // Ensure Tailwind is loaded
import Login from "./login/login"
// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee"

const Layout = ({ children }: { children: React.ReactNode }, isLoggedIn : boolean) => {
  const [userRole, setUserRole] = useState("Manager") // Default role

  // Define the user roles as a union type
  type UserRole = "Manager" | "Team Leader" | "Employee"

  const navigation = {
    Manager: [
      { name: "Dashboard", href:"/Dashboard"},
      { name: "Projects", href: "/Projects" },
      { name: "Tasks", href: "/Tasks" },
      { name: "Knowledge Base", href: "/KnowledgeBase" },
    ],
    "Team Leader": [
      { name: "Dashboard", href:"/Dashboard"},
      { name: "Projects", href: "/Projects" },
      { name: "Tasks", href: "/Tasks" },
      { name: "Knowledge Base", href: "/KnowledgeBase" },
      
    ],
    Employee: [
      { name: "Dashboard", href:"/Dashboard"},
      { name: "Projects", href: "/Projects" },
      { name: "Tasks", href: "/Tasks" },
      { name: "Knowledge Base", href: "/KnowledgeBase" },
    ],
  }
  if (!isLoggedIn) {
    return (
      <html>
        <head>
        <title>Make-It-All: Login</title>
      </head>
        <body>
          <Login></Login>
        </body>
      </html>
    )
  } else {

    return (
     <html>
       <body>
         <div className='min-h-screen flex flex-col'>
           <header className='bg-gray-800 text-white py-4 px-6 flex justify-between items-center'>
             <h1 className='text-lg font-bold'>Dashboard</h1>
             <select
               className='bg-gray-700 text-white py-2 px-4 rounded'
               value={userRole}
               onChange={(e) => setUserRole(e.target.value)}
             >
               <option>Manager</option>
               <option>Team Leader</option>
               <option>Employee</option>
             </select>
           </header>
 
           <div className='flex flex-1'>
             <nav className='bg-gray-100 w-64 p-4'>
               <ul>
                 {navigation[userRole].map((item) => (
                   <li key={item.name} className='mb-2'>
                     <Link
                       href={item.href}
                       className='text-blue-600 hover:text-blue-800'
                     >
                       {item.name}
                     </Link>
                   </li>
                 ))}
               </ul>
             </nav>
 
             <main className='flex-1 p-6'>{children}</main>
           </div>
         </div>
       </body>
     </html>
   )
  }
}

export default Layout
