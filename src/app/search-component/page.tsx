"use client"
import Layout from '../layout/page';
import {SimpleSearchBox, SearchBoxButton} from '../Components/SearchBox';
import { useCallback, useState } from 'react';

export default function SearchCompPreview() {
    const [query0, setQuery0] = useState('');
    const [query1, setQuery1] = useState('');
    const [query2, setQuery2] = useState('');

    const handleInputChange0 = useCallback((q: string) => {
        setQuery0(q);
    }, []);
    const handleInputChange1 = useCallback((q: string) => {
        setQuery1(q);
    }, []);
    const handleClick1 = useCallback((q:string) => {
        setQuery1(q)
    }, []);
    const handleInputChange2 = useCallback((q: string) => {
        setQuery2(q);
    }, []);

    return (
    <Layout tabName={"Search Component Preview"}>
        <div className="mb-8 w-96">
            <SimpleSearchBox 
                placeholder="Simple (No functionality)"
            />
        </div>
        
        <div className="w-96">
            <SimpleSearchBox 
                placeholder="Simple w/ inputChangeCallback" 
                inputChangeCallback={handleInputChange2} 
            />
        </div>
        <p className="mb-4">Query: {query2}</p>
        
        <div className="w-80 w-96">
            <SearchBoxButton 
                placeholder="inputChange Callback" 
                inputChangeCallback={handleInputChange0}
            />
        </div>
        <p className="mb-4">Query: {query0}</p>
        
        <div className="w-80 w-96">
            <SearchBoxButton 
                placeholder="clickChange Callback"
                clickCallback={handleClick1}
            />
        </div>
        <p className="mb-4">Query: {query1}</p>
        
        

    </Layout>
    );
}