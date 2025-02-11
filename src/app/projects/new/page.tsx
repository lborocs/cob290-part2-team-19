"use client"
import { TextInput } from '@/app/components/Input/Text';
import Layout from '../../layout/page';
import React, { useState } from 'react';
import Select from 'react-select';
import { DropdownSelect, SearchableDropdownSelect } from '@/app/components/Input/Dropdown';
import { TextButton } from '@/app/components/Input/Buttons';
import Link from 'next/link';

export default function NewProjectPage() {
    const [selectedTeamLead, setTL] = useState("");


    // get from db
    const projectTagsOptions = [
        {label:"Get tags from db",value:"tagsFromDb"},
        {label:"Tag 1",value:"option1"},
        {label:"Tag 2",value:"option2"},
        {label:"Tag 3",value:"option3"},
    ];

    // get from db
    const projectLeadOptions = [
        {name:"Select", value:""},
        {name:"Employee 1", value:"1"},
        {name:"Employee 2", value:"2"},
        {name:"Employee 3", value:"3"},
    ];

    return (
        <Layout tabName={"Create New Project"} icon={<i className="fa-regular fa-square-plus"></i>}>
        <Link href="/projects/"><div className='text-blue-500 underline underline-offset-2 hover:text-blue-400 transition ease-in-out'>
            <i className="fa-solid fa-chevron-left mr-2"></i>Back
        </div></Link>
        <h1 className='text-center mt-4 text-2xl font-semibold'><i className="fa-solid fa-hashtag"></i> Project Details</h1>
        <div className='flex flex-col items-center gap-6 mt-4'>
            <div className='new-project-entry'>
                <div className='text'><i className="fa-solid fa-heading"></i> Project Name</div>
                <TextInput placeholder='Enter name'
                    style={{backgroundColor:"#fff", border:"1px solid #ccc"}} width='100%'></TextInput>
                <div className='text mt-4'><i className="fa-solid fa-comment-medical"></i> Project Description</div>
                <TextInput placeholder='Enter description' style={{backgroundColor:"#fff", border:"1px solid #ccc"}} width='100%'></TextInput>
            </div>
            <div className='new-project-entry'>
                <div className='text'><i className="fa-solid fa-user"></i> Team Lead</div>
                <div className='w-full'>
                    <SearchableDropdownSelect
                        options={projectLeadOptions}
                        width='18em'
                        inputChangeCallback={setTL}
                        selectedCallback={setTL}
                        inputStyle={{backgroundColor:"#fff", border:"1px solid #ccc"}}
                        dropdownStyle={{backgroundColor:"#fff", border:"1px solid #ccc", color:"#555"}}
                    />
                </div>
            </div>

            <div className='new-project-entry'>
                <div className='text'><i className="fa-solid fa-calendar-days"></i> Start Date</div>
                <div>
                    <input type="date" name="" id="" className='w-full h-[1em] py-[1em] px-[0.5em] rounded border mr-2' style={{border:"1px solid #ccc"}}/>
                    <TextButton
                        icon={<i className="fa-regular fa-clock mr-2"/>}
                        color="bg-blue-100"
                        hoverColor="hover:bg-blue-500 hover:text-white"
                        style={{border:"0.5px solid #ccc", width:"100%", height:"2em", lineHeight:"0.5em", fontWeight:"300", marginTop:".2em"}}
                    >now</TextButton>
                </div>
                <div className='text mt-4'><i className="fa-solid fa-calendar-day"></i> End Date</div>
                <div>
                    <input type="date" name="" id="" className='w-full h-[1em] py-[1em] px-[0.5em] rounded' style={{border:"1px solid #ccc"}}/>
                </div>
            </div>

            <div className='new-project-entry'>
                <div className='text'><i className="fa-solid fa-tags"></i> Tags</div>
                <div className='inline-block'>
                    <Select
                        isMulti
                        name="project_tag"
                        options={projectTagsOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select tags"
                    />
                </div>
            </div>
            <div className="new-project-entry mb-[15em]">
                {/* <div className="text"><i className="fa-solid fa-file-circle-plus"></i> Create Project</div> */}
                <div className="w-full">
                    <TextButton
                        style={{width:"100%", fontSize:"1.5em"}}
                        icon={<i className="fa-solid fa-file-circle-plus mr-2"></i>}
                        color="bg-blue-500 text-[#e6f3f9]"
                        hoverColor="hover:bg-blue-400 hover:text-white"
                    >Create</TextButton>
                </div>
            </div>
        </div>
        </Layout>
    );
}