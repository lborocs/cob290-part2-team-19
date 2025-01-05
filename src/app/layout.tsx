"use client";
import React from 'react';
import "./globals.css"; // Ensure Tailwind is loaded


// this is only here since it has to be, since the layout for the login is completely different to the rest i moved 
// the layout for the pages in to components and then into a layout.tsx in Pages
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Make It All" />
                <meta name="author" content="Loughborough Team Projects Group 19" />

                <link rel="icon" href="/squarelogo.png" />

                <title>Make It All</title>
            </head>
            <body>
                {children}
            </body>
        </html>
    );
};

export default Layout;