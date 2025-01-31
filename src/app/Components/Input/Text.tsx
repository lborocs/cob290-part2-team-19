"use client"
import React, { useEffect, useState } from 'react';

interface SearchBoxButtonProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
    clickCallback?: (query: string) => void;
    buttonElement?: any;
    width?: string;
    height?: string;
}
export const SearchBoxButton = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{},
    clickCallback=(q)=>{},
    buttonElement=<i className="fas fa-search"></i>,
    width="20em",
    height="auto",
} : SearchBoxButtonProps) => {
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
            style={{width: width, height: height}}
        />
        <button 
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded" 
            onClick={handleClick}
        >
            {buttonElement}
        </button>
    </div>
    );
    
}


interface SimpleSearchBoxProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
    width?: string;
    height?: string;
}
export const SimpleSearchBox = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{},
    width="20em",
    height="auto",
} : SimpleSearchBoxProps) => {

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
            style={{width: width, height: height}}
        />
    </div>
    )
};
