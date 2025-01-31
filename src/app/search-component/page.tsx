import Layout from '../layout/page';
import React from 'react';
import SearchBox from '../Components/SearchBox';

export default function NewProjectPage() {
    
    async function cb1(query: string) {
        "use server"
        console.log(query);
    }
    return (
    <Layout tabName={"Search Component Preview"}>
        <div className="mb-4 w-96"><SearchBox searchType="simple" placeholder="Simple"></SearchBox></div>
        <div className="mb-4 w-80"><SearchBox placeholder="With Callback" callback={cb1}></SearchBox></div>
        <div className="mb-4 w-80"><SearchBox placeholder="Default"></SearchBox></div>
        <p id="cbReturn"></p>
    </Layout>
    );
}