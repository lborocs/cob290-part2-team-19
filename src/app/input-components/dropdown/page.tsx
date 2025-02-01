"use client"
import { DropdownSelect, SearchableDropdownSelect, DropDownOptions } from "@/app/Components/Input/Dropdown";
import Layout from "@/app/layout/page";
import { useState } from "react";

export default function DropdownPage() {
    const [q1,setQ1] = useState("");
    const [q2,setQ2] = useState("");
    const [q3,setQ3] = useState("");
    const [q4,setQ4] = useState("");
    
    
    const ddOptions1: DropDownOptions[] = [
        {name: "ABC",value: "ABC"},
        {name: "CDE",value: "cde special option"},
        {name: "Very very long text, so much so, that it should not display on the dropdown fully",value: "long text"},
        {name: "Nothing or something",value: "something"},
    ];
    const ddOptions2: DropDownOptions[] = [
        {name: "0", value: ""},
        {name: "1", value: "1"},
        {name: "2", value: "2"},
        {name: "3", value: "3"},
    ];
    const ddOptions3: DropDownOptions[] = [
        {name:"", value:""},
        {name:"Abc", value:"Abc"},
        {name:"Def", value:"dEf"},
        {name:"Ghi", value:"ghI"},
    ]
    return (
    <Layout tabName="Dropdown Component Preview">
        <p className="mb-4">
            <a className="text-blue-600 underline" href="/input-components">
                <i className="fa-solid fa-caret-left"></i>
                Back
            </a>
        </p>

        <div className="mb-8">
            <DropdownSelect 
                options={ddOptions1} 
                selected="Default"
                selectedCallback={setQ1}
            />
            <p className="ml-[.2em] mt-[.4em]">Callback Data: {q1}</p>
        </div>
        <div className="mb-8">
            <DropdownSelect 
                options={ddOptions2}
                selectedCallback={setQ2}
                width="[4em]"
            />
            <p className="ml-[.2em] mt-[.4em]">Callback Data: {q2}</p>
        </div>
        <div className="mb-8">
            <SearchableDropdownSelect 
                options={ddOptions3}
                inputChangeCallback={setQ3}
                selectedCallback={setQ4}
            />
            <p className="ml-[.2em] mt-[.4em]">Input Data: {q3}</p>
            <p className="ml-[.2em] ">Dropdown Data: {q4}</p>
        </div>
    </Layout>
    )
};