"use client";
import React from 'react';
import Link from 'next/link';

type UserRole = "Manager" | "Team Leader" | "Employee";

interface SidebarProps {
    userRole: UserRole;
}

const Sidebar = ({ userRole }: SidebarProps) => {
    const navigation: Record<UserRole, { name: string; href: string }[]> = {
        Manager: [
            { name: "Dashboard", href: "/dashboard" },
            { name: "Projects", href: "/projects" },
            { name: "Tasks", href: "/tasks" },
            { name: "Knowledge Base", href: "/knowledge-base" },
        ],
        "Team Leader": [
            { name: "Dashboard", href: "/dashboard" },
            { name: "Projects", href: "/projects" },
            { name: "Tasks", href: "/tasks" },
            { name: "Knowledge Base", href: "/knowledge-base" },
            { name: "New Project", href: "/new-project" },
        ],
        Employee: [
            { name: "Dashboard", href: "/Dashboard" },
            { name: "Projects", href: "/Projects" },
            { name: "Tasks", href: "/tasks" },
            { name: "Knowledge Base", href: "/knowledge-base" },
        ],
    };

    return (
        <nav className="fixed top-0 left-0 z-[0] bg-gray-100 w-[15em] p-4 h-[100vh]">
            <div className="flex flex-col items-start mt-[4em]">
                {navigation[userRole].map((item) => (
                    <div key={item.name} className="mb-2">
                        <Link href={item.href} className="text-blue-600 hover:text-blue-800">
                            {item.name}
                        </Link>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default Sidebar;