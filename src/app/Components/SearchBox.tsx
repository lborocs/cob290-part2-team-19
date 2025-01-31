"use client"
import React, { useEffect, useState } from 'react';


interface SearchBoxButtonProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
    clickCallback?: (query: string) => void;
    searchButtonText?: any;
}
export const SearchBoxButton = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{},
    clickCallback=(q)=>{},
    searchButtonText=<i className="fas fa-search"></i>
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
    <div className="inline-block w-full">
        <input
            type="text"
            placeholder={placeholder}
            className="w-5/6 bg-gray-200 text-gray-700 py-2 px-4 mr-1 rounded"
            onChange={handleInputChange}
        />
        <button 
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded" 
            onClick={handleClick}
        >
            {searchButtonText}
        </button>
    </div>
    );
    
}


interface SimpleSearchBoxProps {
    placeholder?:string;
    inputChangeCallback?: (query: string) => void;
}
export const SimpleSearchBox = ({
    placeholder="Search", 
    inputChangeCallback=(q)=>{}
} : SimpleSearchBoxProps) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (inputChangeCallback) {
            inputChangeCallback(e.target.value);
        }
    };

    return (
    <div className="inline-block w-full">
        <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded"
            onChange={handleInputChange}
        />
    </div>
    )
};
