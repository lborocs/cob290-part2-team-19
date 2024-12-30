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
            { name: "Dashboard", href: "/Pages/Dashboard" },
            { name: "Projects", href: "/Pages/Projects" },
            { name: "Tasks", href: "/Pages/Tasks" },
            { name: "Knowledge Base", href: "/Pages/KnowledgeBase" },
        ],
        "Team Leader": [
            { name: "Dashboard", href: "/Pages/Dashboard" },
            { name: "Projects", href: "/Pages/Projects" },
            { name: "Tasks", href: "/Pages/Tasks" },
            { name: "Knowledge Base", href: "/Pages/KnowledgeBase" },
            { name: "New Project", href: "/Pages/NewProject" },
        ],
        Employee: [
            { name: "Dashboard", href: "/Pages/Dashboard" },
            { name: "Projects", href: "/Pages/Projects" },
            { name: "Tasks", href: "/Pages/Tasks" },
            { name: "Knowledge Base", href: "/Pages/KnowledgeBase" },
        ],
    };

    return (
        <nav className="bg-gray-100 w-64 p-4">
            <ul>
                {navigation[userRole].map((item) => (
                    <li key={item.name} className="mb-2">
                        <Link href={item.href} className="text-blue-600 hover:text-blue-800">
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;