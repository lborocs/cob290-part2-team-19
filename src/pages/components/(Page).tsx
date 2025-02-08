import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { UserRole } from "@/types";
import Head from "next/head";
import { useState } from "react";
import '@/globals.css'

interface PageProps {
    children : React.ReactNode;
    tabName?: string;
    icon?: any;
    silent?: boolean;
}

export default function Page({
    children,
    tabName = "Tab Name",
    icon = "",
    silent=false
} : PageProps) {
    const [userRole, setUserRole] = useState<UserRole>("Manager"); // Default role
    const isSilent = silent ? "hidden" : "";


    return (
        <>
        <Head key="a">
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{tabName}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"/>
        </Head>
        <div className={isSilent}>
            <Header userRole={userRole} onRoleChange={setUserRole} 
                tabName={tabName} icon={icon}/>
            <Sidebar userRole={userRole} />
            <div className="ml-[15em] main  w-[calc(100vw-15em)] h-[calc(100vh-5em)] px-4 py-2">
                {children}
            </div>
        </div>
        </>
    )
}