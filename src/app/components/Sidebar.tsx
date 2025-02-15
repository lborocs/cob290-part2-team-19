"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconButton } from './Input/Buttons';

type UserRole = "Manager" | "Team Leader" | "Employee";

interface SidebarProps {
    userRole: UserRole;
}

const LinkDefinition = {
    "dash" : {name:"Dashboard",      href:"/dashboard",      icon: <i className="fa-solid fa-table-columns" />},
    "proj" : {name:"Projects",       href:"/projects",       icon: <i className="fa-solid fa-project-diagram" />},
    "task" : {name:"Tasks",          href:"/tasks",          icon: <i className="fa-solid fa-tasks" />},
    "know" : {name:"Knowledge Base", href:"/knowledge-base", icon: <i className="fa-solid fa-book" />},
    "pro+": { name: "New Project", href: "/projects/new", icon: <i className="fa-regular fa-square-plus" /> },
    "admin": { name: "Admin", href: "/admin", icon: <i className="fa-solid fa-user-shield" />},
}

const navigation = {
    Manager: [
        LinkDefinition["dash"],
        LinkDefinition["proj"],
        LinkDefinition["task"],
        LinkDefinition["know"],
        LinkDefinition["admin"],
    ],
    "Team Leader": [
        LinkDefinition["dash"],
        LinkDefinition["proj"],
        LinkDefinition["task"],
        LinkDefinition["know"],
        LinkDefinition["pro+"],
    ],
    Employee: [
        LinkDefinition["dash"],
        LinkDefinition["proj"],
        LinkDefinition["task"],
        LinkDefinition["know"]
    ],
};

const Sidebar = ({ userRole }: SidebarProps) => {
    return (
    <nav className={`fixed top-0 left-0 z-[0] bg-[#374151] w-[15em] p-4 h-[100vh] sidebar`}>
        <div className="flex flex-col items-start mt-[4em] gap-2">
            {navigation[userRole].map((item) => (
                <div key={item.name} className="nav-link">
                    <Link href={item.href} className="text-blue-50 text-lg">
                        <span className="mr-1">{item.icon}</span>{item.name}
                    </Link>
                </div>
            ))}
        </div>
    </nav>
    );
};

export default Sidebar;