'use client';
import Layout from '../layout/page';
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import TaskCompletionChart from '../components/TaskCompletionChart';
import FullscreenModal from './fullscreen-modal';
import Card from '../components/Card';
import { fetchProjects } from '@/api/fetchProjects';
import { fetchTasks } from '@/api/fetchTasks';
import { Project, Task } from '@/interfaces/interfaces';


export default function Dashboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ToDo, setToDo] = useState(1);
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  //getting projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjects(0);
        setProjects(data);
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  //getting tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTasks(0);
        setTasks(data)
      } catch (error) {
        console.log('Error fetching data:', error)
      }
    };
    fetchData();
  }, []);

  const sortedTasks = tasks.sort((a, b) => new Date(a.finish_date).getTime() - new Date(b.finish_date).getTime());

  return (
    <Layout tabName={"Welcome"} icon={<i className="fa-solid fa-table-columns"></i>}>
      <div className={`h-full p-4 ps-0 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="h-full">
          {/* Top Section */}
          <div className="grid grid-cols-2 gap-4 h-2/5">
            {/* Card 1: Tasks chart */}
            <Card className="min-h-full">
              <TaskCompletionChart />
            </Card>

            {/* Card 2: Upcoming Tasks */}
            <Card className="min-h-full p-4 flex flex-col">
              <div className="pb-2 flex justify-between items-center title">
                <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
                <button onClick={toggleFullscreen} className="pe-2 rounded">
                  <i className="fa-solid fa-expand hover:bg-gray-200 transition"></i>
                </button>
              </div>

              <hr className="border-gray-300 my-2" />

              {/* Upcoming Task List */}
              <ul className="space-y-3 pe-2 overflow-clip overflow-y-auto">
                {sortedTasks && sortedTasks.length > 0 ? (
                  sortedTasks.map((task) => (
                    <li key={task.task_id} className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className={`w-3 h-3 ${task.completed ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">{task.task_name}</div>
                        <div className="text-sm text-gray-500">Project {task.project_id}</div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fa-solid fa-calendar-alt mr-1"></i>
                        <span>{new Date(task.finish_date).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))) : (
                  <li className="text-center text-gray-500">No tasks available</li>
                )}
              </ul>
            </Card>
          </div>

          {/* Bottom Row: Two Cards (2/3 & 1/3 Width, 2/3 Height) */}
          <div className="grid grid-cols-3 gap-4 h-3/5 mt-4">
            {/* Card 3: Project Summary + Table (2/3 Width, 2/3 Height) */}
            <Card className="col-span-2 min-h-full bg-white p-4">
              {/* Project Summary Section */}

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Project Summary</h3>
                <div className="flex gap-4">
                  <select className="border p-2 rounded">
                    <option value="0">Project</option>
                    <option value="Project 1">Project 1</option>
                    <option value="Project 2">Project 2</option>
                    <option value="Project 3">A very long name for Project 3</option>
                  </select>
                  <select className="border p-2 rounded">
                    <option value="0">Manager</option>
                    <option value="Mx. Lorem">Mx. Lorem</option>
                    <option value="Dr. Ipsum">Dr. Ipsum</option>
                    <option value="Mx. Long name for testing">Mx. Long name for testing</option>
                  </select>
                  <select className="border p-2 rounded">
                    <option value="0">Status</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Overdue">Overdue</option>
                    <option value="TBA">To Be Assigned</option>
                  </select>
                </div>
              </div>

              {/* line */}
              <hr className="border-gray-300 my-2" />

              {/* Card-style Table Section */}
              <div className="w-full space-y-3">
                {/* replace with db results */}
                {projects && projects.length > 0 ? (
                  projects.map((project) => {
                    const currentDate = new Date();
                    const finishDate = new Date(project.finish_date);
                    const tlDetails = project.employeeDetails;
                    let statusClass = "";
                    let statusText = "";

                    if (project.completed) {
                      statusClass = "bg-green-200 text-green-800";
                      statusText = "Completed";
                    } else if (currentDate < finishDate) {
                      statusClass = "bg-yellow-200 text-yellow-800";
                      statusText = "In Progress";
                    } else {
                      statusClass = "bg-red-200 text-red-800";
                      statusText = "Overdue";
                    }

                    return (
                      <div
                        key={project.project_id}
                        className="border shadow-sm p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => console.log(`Navigating to ${project.project_name}`)} // change this to the routing - need db
                      >
                        <div>
                          <h4 className="font-semibold text-lg">{project.project_name}</h4>
                          <p className="text-gray-500">Manager: {tlDetails ? `${tlDetails.first_name} ${tlDetails.second_name}` : "Loading..."}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due: {project.finish_date.toString()}</p>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${statusClass}
                          }`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </div>
                    )
                  })) : (
                  <div className="text-center text-gray-500">Not assigned to any Projects</div>
                )}
              </div>
            </Card>

            <Card className="min-h-full p-4 flex flex-col">
              {/* Header */}
              <div className="mb-3 mt-1 flex justify-between items-center">
                <h3 className="text-lg font-semibold">To-Do List</h3>
                <div className="flex gap-2">
                  <button
                    className={`p-2 rounded ${ToDo === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDo(1)}
                  >
                    To-Do
                  </button>
                  <button
                    className={`p-2 rounded ${ToDo === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDo(2)}
                  >
                    Completed
                  </button>
                  <button
                    className={`p-2 rounded ${ToDo === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDo(3)}
                  >
                    Deleted
                  </button>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-300 my-2" />

              {/* To-Do Input */}
              {ToDo === 1 && (
                <div className="flex items-center gap-2 border p-2 rounded">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Add a new todo..."
                  />
                  <button className="bg-blue-500 text-white p-2 rounded">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              )}

              {/* To-Do List Container */}

              <ul className="mt-4 space-y-2">
                {ToDo === 1 && (
                  <>
                    {/* To-Do tasks */}
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">To-Do Task 1</div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">To-Do Task 2</div>
                      </div>
                    </li>
                  </>
                )
                }
                {ToDo === 2 && (
                  <>
                    {/* Completed tasks */}
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">Completed Task 1</div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">Completed Task 2</div>
                      </div>
                    </li>
                  </>
                )}
                {ToDo === 3 && (
                  <>
                    {/* To-Do tasks */}
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">Deleted Task 1</div>
                      </div>
                    </li>
                    <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                      <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">Deleted Task 2</div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </Card>
          </div>
        </div>

      </div>        {isFullscreen && (
        <FullscreenModal isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />

      )}
    </Layout>
  );
}
