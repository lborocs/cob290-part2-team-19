"use client"
import { DropdownSelect } from "@/app/Components/Input/Dropdown";
import Layout from "@/app/layout/page";
import { useState } from "react";

export default function DropdownPage() {
    const [q1,setQ1] = useState("Default");
    const [q2,setQ2] = useState("");
    

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
                options={["ABC","DEF", "Some Long text, like very long text, so much that it should not fit in the normal dropdown", "Default"]} 
                selected="Default"
                selectedCallback={setQ1}
            />
            <p className="ml-[.2em] mt-[.4em]">Callback Data: {q1}</p>
        </div>
        <div className="mb-8">
            <DropdownSelect 
                options={["0", "1","2", "3",]}
                selectedCallback={setQ2}
                width="[4em]"
            />
            <p className="ml-[.2em] mt-[.4em]">Callback Data: {q2}</p>
        </div>
    </Layout>
    )
};