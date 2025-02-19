"use client"
import { TextButton } from "@/app/components/Input/Buttons";
import "./newtask.css"
import { SearchableDropdownSelect } from "@/app/components/Input/Dropdown";
import { TextInput } from "@/app/components/Input/Text";
import Layout from "@/app/layout/page";


export default function NewTaskPage() {
    return (
    <Layout tabName={"Create New Task"} icon={<i className="fa-regular fa-square-plus"></i>}>
        <div className="flex flex-row flex-wrap ml-[2em] mt-[1em] items-center justify-center gap-[1em]">
            <div className="card">
                <h1>Task</h1>
                <h2>ID</h2>
                <TextInput placeholder="Task ID"></TextInput>
                <h2>Name</h2>
                <TextInput placeholder="Task Name"></TextInput>
                <h2>Description</h2>
                <TextInput placeholder="Task Description"></TextInput>
            </div>
            <div className="card">
                <h1>Dates</h1>
                <h2>Start</h2>
                <input type="date" name="" id="" className='w-full h-[1em] py-[1em] px-[0.5em] rounded text-black' style={{border:"1px solid #ccc"}}/>
                <h2>End</h2>
                <input type="date" name="" id="" className='w-full h-[1em] py-[1em] px-[0.5em] rounded text-black' style={{border:"1px solid #ccc"}}/>
            </div>
            <div className="card">
                <h1>Assigned</h1>
                <h2>to Employee</h2>
                <SearchableDropdownSelect
                    options={[{"name":"Select an employee", "value":""}]}
                    inputChangeCallback={() => {}}
                    selectedCallback={() => {}}
                    inputStyle={{backgroundColor:"#fff", border:"1px solid #ccc"}}
                    dropdownStyle={{backgroundColor:"#fff", border:"1px solid #ccc", color:"#555"}}
                />
                <h2>on Project</h2>
                <SearchableDropdownSelect
                    options={[{"name":"Select a project", "value":""}]}
                    inputChangeCallback={() => {}}
                    selectedCallback={() => {}}
                    inputStyle={{backgroundColor:"#fff", border:"1px solid #ccc"}}
                    dropdownStyle={{backgroundColor:"#fff", border:"1px solid #ccc", color:"#555"}}
                />
            </div>
            <div className="w-[30em] h-[19em] flex flex-col items-center justify-center ">
                <TextButton
                    color="bg-blue-500 text-white text-xl"
                    hoverColor="hover:bg-blue-600"
                    icon={<i className="fa-solid fa-plus mr-2"></i>}
                >
                    Create Task
                </TextButton>
            </div>

        </div>

    </Layout>
    )
}