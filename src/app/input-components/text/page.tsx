"use client"
import Layout from '../../layout/page';
import {SimpleSearchBox, SearchBoxButton} from '../../Components/Input/Text';
import { useCallback, useState } from 'react';

export default function SearchCompPreview() {
    const [query0, setQuery0] = useState('');
    const [query1, setQuery1] = useState('');
    const [query2, setQuery2] = useState('');

    const handleInputChange0 = useCallback((q: string) => {
        setQuery0(q);
    }, []);
    const handleClick1 = useCallback((q:string) => {
        setQuery1(q)
    }, []);
    const handleInputChange2 = useCallback((q: string) => {
        setQuery2(q);
    }, []);

    return (
    <Layout tabName={"Text Component Preview"}>
        <p className="mb-4">
            <a className="text-blue-600 underline" href="/input-components">
                <i className="fa-solid fa-caret-left"></i>
                Back
            </a>
        </p>

        <h1 className='text-xl font-bold'>No Functionality</h1>
        <div className="mb-8">
            <SimpleSearchBox 
                placeholder="Simple (No functionality)"
            />
        </div>

        <div className="mb-8">
            <SimpleSearchBox 
            width="50em"
                placeholder="Simple (No functionality) with width change"
            />
        </div>
        
        <div className="mb-8">
            <SearchBoxButton 
                placeholder="V2 with width change"
                width="30em"
            />
        </div>
        
        <div className="mb-8">
            <SearchBoxButton 
                placeholder="V2 with diff icon"
                width=""
                buttonElement={<i className="fa-solid fa-download"></i>}
            />
        </div>
        
        <hr  className='mb-8'/>

        <h1 className='text-xl font-bold'>With Functionality</h1>
        <div className="">
            <SimpleSearchBox 
                placeholder="Simple w/ inputChangeCallback" 
                inputChangeCallback={handleInputChange2} 
            />
        </div>
        <p className="mb-4">Query: {query2}</p>
        
        <div className="">
            <SearchBoxButton 
                placeholder="inputChange Callback" 
                inputChangeCallback={handleInputChange0}
            />
        </div>
        <p className="mb-4">Query: {query0}</p>
        
        <div className="">
            <SearchBoxButton 
                placeholder="clickChange Callback"
                clickCallback={handleClick1}
            />
        </div>
        <p className="mb-[20em]">Query: {query1}</p>
        

    </Layout>
    );
}