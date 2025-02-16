"use client"
import React, { useEffect, useState } from "react"
import "../globals.css" // Ensure Tailwind is loaded
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Head from "next/head"
import { useRouter } from "next/navigation"

// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee"

interface LayoutProps {
  tabName?: string
  icon?: any
  children?: React.ReactNode // No need for default null here
}

const Layout: React.FC<LayoutProps> = ({
  tabName = "",
  icon = "",
  children,
}) => {
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>("Employee") // Default role
  const [isClient, setIsClient] = useState(false) // To check if we are in client-side rendering

  useEffect(() => {
    setIsClient(true) // Ensures we are running on the client

    const userData = JSON.parse(localStorage.getItem("userData") || "null")

    if (!userData) {
      router.push("/login") // Redirect if no user data
    } else if (userData.user_type_id !== undefined) {
      // Map user_type_id to role
      const roleMap: Record<number, UserRole> = {
        0: "Manager",
        1: "Team Leader",
        2: "Employee",
      }
      setUserRole(roleMap[userData.user_type_id] || "Employee")
    }
  }, [router]) // Runs once when the component mounts

  // Prevent rendering until client-side execution to avoid hydration errors
  if (!isClient) return null

  return (
    <html lang='en'>
      <link
        rel='stylesheet'
        href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css'
      />
      <Head>
        <title>Make It All</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='description' content='Make It All' />
        <meta name='author' content='Loughborough Team Projects Group 19' />
        <link rel='icon' href='/squarelogo.png' />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css'
        />
      </Head>
      <body>
        <div>
          <Header
            userRole={userRole}
            onRoleChange={setUserRole}
            tabName={tabName}
            icon={icon}
          />
          <Sidebar />
          <main className='ml-[16em] mt-[.75em] h-[calc(100vh-8rem)]'>
            {icon} <span className='text-xl font-bold'>{tabName}</span>
            <hr />
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

export default Layout
