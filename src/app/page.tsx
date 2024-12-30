"use client";
import React, { useState } from 'react';
import "./globals.css"; // Ensure Tailwind is loaded
import Login from './login/login'
// Define the user roles as a union type
type UserRole = "Manager" | "Team Leader" | "Employee";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <head>
        <title>Make It All</title>
      </head>

      <body>
        {/*since we want to start with a login */}
        <Login></Login>
      </body>
    </html>
  );

};

export default Layout;