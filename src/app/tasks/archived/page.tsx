"use client"

import { IconButton, TextButton } from "@/app/components/Input/Buttons";
import { Modal } from "@/app/components/Input/Modals";
import Layout from "@/app/layout/page";
import { useState } from "react";


const ArchivedTasks = () => {
    const [m1, setM1] = useState(true);
    const [m2, setM2] = useState(true);
    const [m3, setM3] = useState(true);
    const [m4, setM4] = useState(true);

    return (
        <Layout tabName="Archived Tasks" icon={<i className='fa-solid fa-list-check'/>}>
            <div className="mt-4">
                <h1 className="text-xl font-bold"><i className='fa-solid fa-list-check mr-2'/>Archived Tasks</h1>
                <p className="text-gray-500">View all archived tasks here.</p>
                <p className="text-gray-500">Tasks will automatically deleted <b>2 months</b> from the archive date.</p>
            </div>

            <style jsx>{`
                .table-cell {
                    max-width: 20em;
                    width: min-content;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .date-cell {
                    max-width: 6em !important;
                }
            `}</style>
            <table className="min-w-full  mt-4">
                <thead className="bg-[#1f2937] text-gray-50 uppercase tracking-wider text-left text-xs">
                    <tr>
                        <th scope="col" className="max-w-[10em] table-cell px-3 py-3 text-center font-normal" style={{borderTopLeftRadius: '1rem'}}>
                            Select
                        </th>
                        <th scope="col" className="table-cell font-normal">
                            <i className="fa-solid fa-font"></i> Task Name
                        </th>
                        <th scope="col" className="table-cell font-normal">
                            <i className="fa-solid fa-user"></i> Project
                        </th>
                        <th scope="col" className="table-cell font-normal">
                            <i className="fa-solid fa-user"></i> Assigned to
                        </th>
                        <th scope="col" className="table-cell font-normal date-cell" >
                            <i className="fa-solid fa-calendar-days"></i> Date Archived
                        </th>
                        <th scope="col" className="table-cell text-center font-normal" >
                            Status
                        </th>
                        <th scope="col" className="table-cell font-normal" >
                            Delete in
                        </th>
                        <th scope="col" className="table-cell text-center font-normal" style={{ borderTopRightRadius: '1rem'}}>
                            Actions
                        </th>
                        
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 whitespace-nowrap text-sm">
                    <tr className="hover:bg-blue-50">
                        <td className="px-2 py-3 table-cell max-w-[10em] font-medium text-gray-900 text-center" 
                            style={{boxShadow:"inset 0.5px 0px 0px 0px #e5e7eb"}}>
                            <input type="checkbox" className="w-6 h-6"/>
                        </td>
                        <td className="px-2 py-3 table-cell font-medium text-gray-900">
                            Print this doc
                        </td>
                        <td className="px-2 py-3 table-cell font-medium text-gray-900">
                            Project 4
                        </td>
                        <td className="px-2 py-3 table-cell font-medium text-gray-900">
                            Employee A
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500 date-cell">
                            2023-01-01
                        </td>
                        <td className="px-2 py-3 table-cell text-green-600 text-center">
                            Completed
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500">
                            1mo, 15d
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500 text-center"
                            style={{boxShadow:"inset -0.5px 0px 0px 0px #e5e7eb"}}>
                            <IconButton callback={()=>{setM1(false)}}/>                                
                        </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-blue-50">
                        <td className="px-2 py-3 table-cell max-w-[10em] text-sm font-medium text-gray-900 text-center"
                            style={{boxShadow:"inset 0.5px 0px 0px 0px #e5e7eb"}}>
                            <input type="checkbox" className="w-6 h-6"/>
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Integrate db to app
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Project 2
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Jake Brooks
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500 date-cell">
                            2025-02-07
                        </td>
                        <td className="px-2 py-3 table-cell text-yellow-600 text-center">
                            Unfinished
                        </td>
                        <td className="px-2 py-3 table-cell text-red-500 font-bold">
                            7 days 
                        </td>
                        <td className="px-2 py-3 table-cell text-center"
                            style={{boxShadow:"inset -0.5px 0px 0px 0px #e5e7eb"}}>
                            <IconButton callback={()=>{setM2(false)}}/>
                        </td>
                    </tr>
                    <tr className="hover:bg-blue-50">
                        <td className="px-2 py-3 table-cell max-w-[10em] text-sm font-medium text-gray-900 text-center"
                            style={{boxShadow:"inset 0.5px 0px 0px 0px #e5e7eb"}}>
                            <input type="checkbox" className="w-6 h-6"/>
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Fix this darned thing. This is a very long task name that should not fit
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Project 3
                        </td>
                        <td className="px-2 py-3 table-cell ">
                            Someone here
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500 date-cell">
                            2023-02-01
                        </td>
                        <td className="px-2 py-3 table-cell text-gray-500 text-center">
                            Not Started
                        </td>
                        <td className="px-2 py-3 table-cell text-orange-400 font-semibold">
                            25 days
                        </td>
                        <td className="px-2 py-3 table-cell text-center"
                            style={{boxShadow:"inset -0.5px 0px 0px 0px #e5e7eb"}}>
                            <IconButton callback={()=>{setM3(false)}}/>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="h-3 bg-gray-200">
                        <td style={{borderBottomLeftRadius:"0.2em"}}></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style={{borderBottomRightRadius:"0.2rem"}}></td>
                    </tr>
                </tfoot>
            </table>
            <div className="flex mt-4 gap-2 justify-between">
                <div className="flex gap-2">
                    <TextButton
                        icon={<i className="fa-solid fa-rotate-right mr-2"></i>}
                        callback={()=>{alert("Restore Selected")}}>
                            Restore Selected
                    </TextButton>
                    <TextButton
                        color="bg-blue-500"
                        hoverColor="hover:bg-blue-700"
                        textColor="text-white"
                        icon={<i className="fa-solid fa-rotate mr-2"></i>}
                        callback={()=>{alert("Restore All")}}>
                            Restore All
                    </TextButton>
                </div>

                <div className="flex gap-2">
                <TextButton
                        color="bg-yellow-500"
                        hoverColor="hover:bg-yellow-600"
                        textColor="text-white"
                        icon={<i className="fa-solid fa-list-check mr-2"></i>}
                        callback={()=>{alert("Archive Task")}}>
                            Archive Task
                    </TextButton>
                    <TextButton
                        color="bg-red-500"
                        hoverColor="hover:bg-red-700"
                        textColor="text-white"
                        icon={<i className="fa-solid fa-trash-can mr-2"></i>}
                        callback={()=>{setM4(false)}}>
                            Delete Selected
                    </TextButton>
                </div>
            </div>
            <Modal getHidden={()=>m1} setHidden={(h)=>setM1(h)}
                header="Project 1">Some Actions</Modal>
            <Modal getHidden={()=>m2} setHidden={(h)=>setM2(h)}
                header="Project 2">Some Actions</Modal>
            <Modal getHidden={()=>m3} setHidden={(h)=>setM3(h)}
                header="Project 3">Some Actions</Modal>
            <Modal getHidden={()=>m4} setHidden={(h)=>setM4(h)}
                header="Are you sure"
                icon={<i className="fa-solid fa-trash-can mr-2 ml-2"></i>}>
                <p>
                    Do you want to <b>delete</b> these tasks? <br />
                    This process cannot be <b>undone</b>!
                </p>
                <div className="flex justify-between w-[100%] mt-4">
                    <TextButton callback={()=>{setM4(true)}}>Cancel</TextButton>
                    <TextButton 
                        color="bg-red-500" 
                        textColor="text-white"
                        hoverColor="hover:bg-red-600"
                        icon={<i className="fa-solid fa-trash-can mr-2"></i>}
                        callback={()=>{setM4(true)}}
                    >Delete</TextButton>
                </div>
            </Modal>
        </Layout>
    );
}
export default ArchivedTasks;