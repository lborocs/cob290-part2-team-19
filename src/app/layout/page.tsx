"use client";
import React, { useState } from 'react';
import "../globals.css"; // Ensure Tailwind is loaded
import Header from '../(components)/Header';
import Sidebar from '../(components)/Sidebar';
import Head from 'next/head';

// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee";

interface LayoutProps {
    tabName?: string;
    icon?: any;
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ tabName="", icon = "", children=null }) => {
    const [userRole, setUserRole] = useState<UserRole>("Manager"); // Default role
    let title = "Make It All";
    
    return (
        <html lang="en">
            <Head>
                <title>{title}</title>
            </Head>
            <body>
                <div className="min-h-screen flex flex-col">
                    <Header userRole={userRole} onRoleChange={setUserRole} tabName={tabName} icon={icon} />
                    <Sidebar userRole={userRole} />
                    <div className="flex flex-1 ml-[15em]">
                        <main className="flex-1 p-6 pt-1">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
};
export default Layout;