// "use client";
// import React, { useState } from 'react';
// import "./globals.css"; // Ensure Tailwind is loaded
// // Define the user roles as a union type
// type UserRole = "Manager" | "Team Leader" | "Employee";

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   return (
    
//   );
// };

// export default Layout;
"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Layout = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/login.html');
  }, []);

  return (
    <div>
    </div>
  );
}

export default Layout;