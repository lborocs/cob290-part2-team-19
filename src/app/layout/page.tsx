"use client";
import React, { useState } from 'react';
import "../globals.css"; // Ensure Tailwind is loaded
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';

// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>("Manager"); // Default role

  return (
    <html lang="en">
      <head>
        <title>Make It All</title>
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Header userRole={userRole} onRoleChange={setUserRole} />
          <div className="flex flex-1">
            <Sidebar userRole={userRole} />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
};
export default Layout;