"use client"
import React, { useEffect, useState } from 'react';

interface TextInputButtonProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
    clickCallback?: (query: string) => void;
    icon?: any;
    width?: string;
    height?: string;
    style?: any;
}
export const TextInputButton = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{},
    clickCallback=(q)=>{},
    icon=<i className="fas fa-search"></i>,
    width="20em",
    height="auto",
    style={},
} : TextInputButtonProps) => {
    const [text, setText] = useState('');

    const handleInputChange = (e: any) => {
        setText(e.target.value);
        if (inputChangeCallback) {
            inputChangeCallback(e.target.value);
        }
    };
    const handleClick = (e: any) => {
        console.log(text);
        if (clickCallback) {
            clickCallback(text);
        }
    };
    
    return (
    <div className="fit-content inline-block">
        <input
            type="text"
            placeholder={placeholder}
            className=" bg-gray-200 text-gray-700 py-2 px-4 mr-1 rounded"
            onChange={handleInputChange}
            style={{width: width, height: height, ...style}}
        />
        <button 
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded" 
            onClick={handleClick}
        >
            {icon}
        </button>
    </div>
    );
    
}


interface TextInputProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
    width?: string;
    height?: string;
    style?: any;
}
export const TextInput = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{},
    width="20em",
    height="auto",
    style={},
} : TextInputProps) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (inputChangeCallback) {
            inputChangeCallback(e.target.value);
        }
    };

    return (
    <div className="fit-content inline-block">
        <input
            type="text"
            placeholder={placeholder}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded"
            onChange={handleInputChange}
            style={{width: width, height: height, ...style}}
        />
    </div>
    )
};
