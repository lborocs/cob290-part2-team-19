"use client"
import "@/globals.css";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { UserRole } from "@/types";
import { useState } from "react";
import Head from "next/head";

interface RootLayoutProps {
    children : React.ReactNode;
    tabName?: string;
    icon?: any;
}

export default function RootLayout({
    children,
    tabName = "Tab Name",
    icon = ""
} : RootLayoutProps) {
    const [userRole, setUserRole] = useState<UserRole>("Manager"); // Default role

    return (
        <html lang="en">
        <Head key="a">
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{tabName}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"/>
        </Head>
        <body>
            <Header userRole={userRole} onRoleChange={setUserRole} 
                tabName={tabName} icon={icon}/>
            <Sidebar userRole={userRole} />
            <div className="ml-[15em] main w-[calc(100vw-15em)] h-[calc(100vh-5em)]">
                {children}
            </div>
        </body>
        </html>
    )
}