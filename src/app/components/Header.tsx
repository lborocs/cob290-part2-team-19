"use client";
import React, { useState, useEffect } from 'react';

type UserRole = "Manager" | "Team Leader" | "Employee";

interface HeaderProps {
    userRole: UserRole;
    onRoleChange: (role: UserRole) => void;
    tabName: string;
    icon?: any;
}

const Header = ({ userRole, onRoleChange, tabName, icon = "" }: HeaderProps) => {
    const [role, setUserRole] = useState<UserRole>("Employee"); // Default role

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData && userData.user_type_id) {
            // Map the user_type_id to a userRole string
            const roleMap: Record<number, UserRole> = {
                0: "Manager",
                1: "Team Leader",
                2: "Employee",
            };
            setUserRole(roleMap[userData.user_type_id] || "Employee"); // Default to "Employee" if user_type_id is invalid
        }
    }, []); // This effect runs only once, on component mount

    const handleRoleChange = (role: UserRole) => {
        setUserRole(role);
        onRoleChange(role);
    };

    return (
        <header className="sticky top-0 left-0 z-[1] bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <img src="/squarelogo.png" alt="icon" className='h-6' />
                <h1 className="text-lg font-bold">Make It All</h1>
            </div>
            <div className="text-lg font-semibold">
                {icon} {tabName}
            </div>
            <select
                className="bg-gray-700 text-white py-2 px-4 rounded"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            >
                <option value="Manager">Manager</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Employee">Employee</option>
            </select>
        </header>
    );
};

export default Header;
