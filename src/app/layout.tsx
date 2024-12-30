"use client";
import React from 'react';
import "./globals.css"; // Ensure Tailwind is loaded


// this is only here since it has to be, since the layout for the login is completely different to the rest i moved 
// the layout for the pages in to components and then into a layout.tsx in Pages
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html>
            <head>
                <title>Make It All</title>
            </head>
            <body>
                {children}
            </body>
        </html>
    );
};

export default Layout;