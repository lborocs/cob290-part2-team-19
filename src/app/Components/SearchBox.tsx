"use client"
import React, { useEffect } from 'react';


interface SearchBoxProps {
    searchType?: string;
    placeholder?:string;
    callback?: (query: string) => void;
}


const SearchBox = ({
    searchType="default", 
    placeholder="Search", 
    callback=(q)=>{}
} : SearchBoxProps) => {

    const [query, setQuery] = React.useState('');
    
    const handleInputChange = (e:any) => {
        setQuery(e.target.value);
    }
    useEffect(() => {
        callback(query);
    }, [query]);
    

    if (searchType=="simple") {
        return (
            <div className="inline-block w-full">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded"
                onChange={(e) => handleInputChange(e as any)}
            />
            </div>
        )
    }
    else {
        return (
            <div className="inline-block w-full">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-4/5 bg-gray-200 text-gray-700 py-2 px-4 mr-1 rounded"
                    onChange={(e) => handleInputChange(e as any)}
                />
                <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded"><i className="fas fa-search"></i></button>
            </div>
        );
    }
}
export default SearchBox;
