"use client"
import { useEffect, useState } from "react";
import { IconButton, TextButton } from "@/app/components/Input/Buttons";
import { Modal } from "@/app/components/Input/Modals";
import Layout from "@/app/layout/page";
import { fetchArchivedTasks } from "@/api/fetchTasks";
import { Task } from "@/interfaces/interfaces";

const ArchivedTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [m1, setM1] = useState(true);
    const [m2, setM2] = useState(true);
    const [m3, setM3] = useState(true);
    const [m4, setM4] = useState(true);
    const [loggedInUser, setLoggedInUser] = useState<number | null>(null);
    const [userType, setUserType] = useState<number | null>(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.id !== undefined && userData.user_type_id !== undefined) {
            setUserType(userData.user_type_id);
            setLoggedInUser(userData.id);
        }
    }, []);

    useEffect(() => {
        if (loggedInUser === null || userType === null) return;
        const fetchData = async () => {
            try {
                const [tasksData,] = await Promise.all([
                    fetchArchivedTasks(),
                ]);

                setTasks(tasksData)
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        };

        fetchData();
    }, [loggedInUser, userType]);

    const handleSelectTask = (taskId: number) => {
        setSelectedTasks(prevSelected =>
            prevSelected.includes(taskId)
                ? prevSelected.filter(id => id !== taskId)
                : [...prevSelected, taskId]
        );
    };

    const handleDeleteSelectedTasks = async () => {
        try {
            await Promise.all(
                selectedTasks.map(async (taskId) => {
                    await fetch(`http://localhost:3300/delete_task?task_id=${taskId}`, {
                        method: 'DELETE',
                    });
                })
            );
            setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.task_id)));
            setSelectedTasks([]);
        } catch (error) {
            console.error('Error deleting tasks:', error);
        }
    };

    const handleRestoreSelectedTasks = async () => {
        try {
            await Promise.all(
                selectedTasks.map(async (taskId) => {
                    await fetch(`http://localhost:3300/delete_archived_task?task_id=${taskId}`, {
                        method: 'POST',
                    });
                })
            );
            setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.task_id)));
            setSelectedTasks([]);
        } catch (error) {
            console.error('Error restoring tasks:', error);
        }
    };

    const handleRestoreAllTasks = async () => {
        try {
            await Promise.all(
                tasks.map(async (task) => {
                    await fetch(`http://localhost:3300/delete_archived_task?task_id=${task.task_id}`, {
                        method: 'POST',
                    });
                })
            );
            setTasks([]);
            setSelectedTasks([]);
        } catch (error) {
            console.error('Error restoring tasks:', error);
        }
    };
    return (
        <Layout tabName="Archived Tasks" icon={<i className='fa-solid fa-box-archive' />}>
            <div className="mt-4">
                <h1 className="text-xl font-bold"><i className='fa-solid fa-box-archive mr-2' />Archived Tasks</h1>
                <p className="text-gray-500">View all archived tasks here.</p>
                <p className="text-gray-500">Tasks will automatically be deleted <b>2 months</b> from the archive date.</p>
                <p className="text-gray-500">Deleted tasks <b>will</b> delete attached tasks.</p>
            </div>
            <style jsx>{`
                .table-cell {
                    max-width: 15em;
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
                        <th scope="col" className="table-cell max-w-[10em] px-3 py-3 text-center font-normal" style={{ borderTopLeftRadius: '1rem' }}>
                            Select
                        </th>
                        <th scope="col" className="table-cell font-normal w-[5em] overflow-ellipsis whitespace-nowrap">
                            <i className="fa-solid fa-font"></i> Task Name
                        </th>
                        <th scope="col" className="table-cell font-normal">
                            <i className="fa-solid fa-user"></i> Team Lead
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
                        <th scope="col" className="table-cell text-center font-normal" style={{ borderTopRightRadius: '1rem' }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 whitespace-nowrap text-sm">
                    {tasks.map((task, index) => (
                        <tr key={index} className="hover:bg-blue-50">
                            <td className="table-cell px-2 py-3 font-medium text-gray-900 text-center"
                                style={{ boxShadow: "inset 0.5px 0px 0px 0px #e5e7eb" }}>
                                <input
                                    type="checkbox"
                                    className="w-6 h-6"
                                    checked={selectedTasks.includes(task.task_id)}
                                    onChange={() => handleSelectTask(task.task_id)}
                                />
                            </td>
                            <td className="table-cell px-2 py-3 font-medium text-gray-900">
                                {task.task_name}
                            </td>
                            <td className="table-cell px-2 py-3 font-medium text-gray-900">
                                {task.employeeDetails.first_name}
                            </td>

                            <td className="table-cell px-2 py-3 text-green-600 text-center">
                                {task.status}
                            </td>
                            <td className="table-cell px-2 py-3 text-gray-500">
                                {/* Calculate remaining days */}
                            </td>
                            <td className="table-cell px-2 py-3 text-gray-500 text-center"
                                style={{ boxShadow: "inset -0.5px 0px 0px 0px #e5e7eb" }}>
                                <IconButton callback={() => { setM1(false) }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="h-3 bg-gray-200">
                        <td style={{ borderBottomLeftRadius: "0.2em" }}></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style={{ borderBottomRightRadius: "0.2rem" }}></td>
                    </tr>
                </tfoot>
            </table>
            <div className="flex mt-4 gap-2 justify-between">
                <div className="flex gap-2">
                    <TextButton
                        icon={<i className="fa-solid fa-rotate-right mr-2"></i>}
                        callback={handleRestoreSelectedTasks}>
                        Restore Selected
                    </TextButton>
                    <TextButton
                        color="bg-blue-500"
                        hoverColor="hover:bg-blue-700"
                        textColor="text-white"
                        icon={<i className="fa-solid fa-rotate mr-2"></i>}
                        callback={handleRestoreAllTasks}>
                        Restore All
                    </TextButton>
                </div>

                <div className="flex gap-2">
                    <TextButton
                        color="bg-red-500"
                        hoverColor="hover:bg-red-700"
                        textColor="text-white"
                        icon={<i className="fa-solid fa-trash-can mr-2"></i>}
                        callback={handleDeleteSelectedTasks}>
                        Delete Selected
                    </TextButton>
                </div>
            </div>
            <Modal getHidden={() => m1} setHidden={(h) => setM1(h)}
                header="Task 1">Some Actions</Modal>
            <Modal getHidden={() => m2} setHidden={(h) => setM2(h)}
                header="Task 2">Some Actions</Modal>
            <Modal getHidden={() => m3} setHidden={(h) => setM3(h)}
                header="Task 3">Some Actions</Modal>
            <Modal getHidden={() => m4} setHidden={(h) => setM4(h)}
                header="Are you sure"
                icon={<i className="fa-solid fa-trash-can mr-2 ml-2"></i>}>
                <p>
                    Do you want to <b>delete</b> these tasks? <br />
                    This process cannot be <b>undone</b>!
                </p>
                <div className="flex justify-between w-[100%] mt-4">
                    <TextButton callback={() => { setM4(true) }}>Cancel</TextButton>
                    <TextButton
                        color="bg-red-500"
                        textColor="text-white"
                        hoverColor="hover:bg-red-600"
                        icon={<i className="fa-solid fa-trash-can mr-2"></i>}
                        callback={() => { setM4(true) }}
                    >Delete</TextButton>
                </div>
            </Modal>
        </Layout>
    );
}
export default ArchivedTasks;