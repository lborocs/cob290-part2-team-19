"use client";
import React, { useState } from 'react';
import "../globals.css"; // Ensure Tailwind is loaded
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee";

interface LayoutProps {
    tabName?: string;
    icon?: any;
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ tabName="", icon = "", children=null }) => {
    const router = useRouter();
    const [userRole, setUserRole] = useState<UserRole>("Manager"); // Default role
    let title = "Make It All";
    const userData = JSON.parse(localStorage.getItem('userdata') || 'null');
    
    // enable in prod
    // if (userData === null) {
    //     console.log("User data is empty");
    //     router.push("/login");
    // }

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Make It All" />
            <meta name="author" content="Loughborough Team Projects Group 19" />

            <link rel="icon" href="/squarelogo.png" />

            <title>{title}</title>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"/>
        </head>
        <body>
            <Header userRole={userRole} onRoleChange={setUserRole} tabName={tabName} icon={icon} />
            <Sidebar userRole={userRole} />
            <div className="ml-[16em] mt-[.75em] h-[calc(100vh-8rem)]">
                {icon} <span className="text-xl font-bold">{tabName}</span> 
                <hr />
                {children}
            </div>
        </body>
        </html>
    );
};
export default Layout;