"use client";
import React from 'react';

type UserRole = "Manager" | "Team Leader" | "Employee";

interface HeaderProps {
    userRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

const Header = ({ userRole, onRoleChange }: HeaderProps) => {
    return (
        <header className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-lg font-bold">Make It All</h1>
            <select
                className="bg-gray-700 text-white py-2 px-4 rounded"
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
            >
                <option value="Manager">Manager</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Employee">Employee</option>
            </select>
        </header>
    );
};

export default Header;