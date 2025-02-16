'use client';
import Layout from '../layout/page';
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import TaskCompletionChart from '../components/TaskCompletionChart';
import Card from '../components/Card';
import { fetchProjects } from '@/api/fetchProjects';
import { fetchTasks } from '@/api/fetchTasks';
import { fetchToDo } from '@/api/fetchToDo';
import { addToDo } from '@/api/addToDo';
import { Project, Task, ToDo } from '@/interfaces/interfaces';
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from "@fullcalendar/react";
import { updateToDoStatus } from '@/api/updateToDo';
import { fetchUserType } from '@/api/fetchUserType';
import Select from 'react-select'

export default function Dashboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ToDoState, setToDoState] = useState(1);
  const [ToDos, setToDos] = useState<ToDo[]>([]);
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newToDoDescription, setNewToDoDescription] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('0');
  const [selectedManager, setSelectedManager] = useState<string>('0');
  const [selectedStatus, setSelectedStatus] = useState<string>('0');
  const [sillyToDoID, setSillyToDo] = useState<number>(1);
  const [loggedInUser, setLoggedInUser] = useState<number>(0)
  const [userType, setUserType] = useState<number>(2)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setLoggedInUser(parsedUser ?? 0);
      fetchUserType(parsedUser ?? 0).then(result => {
        if (result.success) {
          setUserType(result.userType ?? 2);
          console.log("user type", userType);
        } else {
          console.error(result.message);
        }
      });
    }
  }, []);


  //getting projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjects(loggedInUser, userType);
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
        const data = await fetchTasks(loggedInUser, userType);
        setTasks(data || [])
      } catch (error) {
        console.log('Error fetching data:', error)
      }
    };
    fetchData();
  }, []);

  //getting todo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchToDo(loggedInUser);
        setToDos(data || []);
      } catch (error) {
        console.log('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  //we want to get the sillyid
  useEffect(() => {
    setSillyToDo(ToDos.length > 0 ? ToDos[ToDos.length - 1].todo_id + 1 : 1);
  }, [ToDos])

  //sort tasks
  useEffect(() => {
    if (tasks != null) {
      const sortedTasks = tasks.sort((a, b) => new Date(a.finish_date).getTime() - new Date(b.finish_date).getTime());
      setTasks(sortedTasks);
    }
  }, [tasks]);


  const events = tasks.map((task) => {
    const currentDate = new Date();
    const finishDate = new Date(task.finish_date);
    const isOverdue = currentDate > finishDate;
    const completed = task.completed;
    const taskColor = completed ? "green" : (isOverdue ? "red" : "orange");

    return {
      id: task.task_id.toString(),
      title: task.task_name,
      start: task.finish_date,
      allDay: true,
      backgroundColor: taskColor,
    };
  });



  // check for any tasks due for today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.finish_date).toISOString().split("T")[0];
      return taskDate === today;
    });
    setSelectedDateTasks(filteredTasks);
  }, [tasks]);


  const handleDateClick = (info: DateClickArg) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);

    // tasks for the selected date
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.finish_date).toISOString().split("T")[0];
      return taskDate === clickedDate;
    });

    setSelectedDateTasks(filteredTasks);
  };

  const handleAddToDo = async () => {
    if (!newToDoDescription.trim()) {
      alert('To-Do description cannot be empty.');
      return;
    }

    const result = await addToDo(loggedInUser, newToDoDescription.trim(), sillyToDoID);
    if (result.success) {
      setNewToDoDescription('');
      //update the todos
      const data = await fetchToDo(loggedInUser);
      setToDos(data);
    }
  };

  const handleCompleteToDo = async (todo_id: number) => {
    const result = await updateToDoStatus(todo_id, loggedInUser, 1, null);
    if (result.success) {
      const updatedToDos = ToDos.map(todo =>
        todo.todo_id === todo_id ? { ...todo, completed: true } : todo
      );
      setToDos(updatedToDos);
    } else {
      alert(result.message);
    }
  };
  const handleDeleteToDo = async (todo_id: number) => {
    const result = await updateToDoStatus(todo_id, loggedInUser, null, 1);
    if (result.success) {
      const updatedToDos = ToDos.map(todo =>
        todo.todo_id === todo_id ? { ...todo, deleted: true } : todo
      );
      setToDos(updatedToDos);
    } else {
      alert(result.message);
    }
  };

  const handleUncompleteToDo = async (todo_id: number) => {
    const result = await updateToDoStatus(todo_id, loggedInUser, 0, null);
    if (result.success) {
      const updatedToDos = ToDos.map(todo =>
        todo.todo_id === todo_id ? { ...todo, completed: false } : todo
      );
      setToDos(updatedToDos);
    } else {
      alert(result.message);
    }
  };

  const handleRestoreToDo = async (todo_id: number) => {
    const result = await updateToDoStatus(todo_id, loggedInUser, null, 0);
    if (result.success) {
      const updatedToDos = ToDos.map(todo =>
        todo.todo_id === todo_id ? { ...todo, deleted: false } : todo
      );
      setToDos(updatedToDos);
    } else {
      alert(result.message);
    }

  };

  const handleProjectChange = (selectedOption: any) => {
    setSelectedProject(selectedOption ? selectedOption.project_name : '0');
  };

  const handleManagerChange = (selectedOption: any) => {
    setSelectedManager(selectedOption ? `${selectedOption.employeeDetails.first_name} ${selectedOption.employeeDetails.second_name}` : '0');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleResetFilters = () => {
    setSelectedProject('0');
    setSelectedManager('0');
    setSelectedStatus('0');
  };



  // filter the project based on the selectors
  const filteredProjects = projects.filter(project => {
    const matchesProject = selectedProject === '0' || project.project_name === selectedProject;
    const matchesManager = selectedManager === '0' || (project.employeeDetails && `${project.employeeDetails.first_name} ${project.employeeDetails.second_name}` === selectedManager);
    const matchesStatus = selectedStatus === '0' ||
      (selectedStatus === 'Completed' && project.completed) ||
      (selectedStatus === 'In Progress' && !project.completed && new Date() < new Date(project.finish_date)) ||
      (selectedStatus === 'Overdue' && !project.completed && new Date() > new Date(project.finish_date));
    return matchesProject && matchesManager && matchesStatus;
  });

  return (
    <Layout tabName={"Dashboard"} icon={<i className="fa-solid fa-table-columns"></i>}>
      <div className={`h-full p-4 ps-0 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="h-full">
          <div className="grid grid-cols-2 gap-4 h-2/5">
            {/* Card 1: Tasks chart */}
            <Card className="min-h-full">
              <TaskCompletionChart tasks={tasks} />
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


              <ul className="space-y-3 pe-2 overflow-clip overflow-y-auto">
                {tasks && tasks.length > 0 ? (
                  tasks
                    .filter((task) => !task.completed)
                    .map((task) => {
                      const currentDate = new Date();
                      const finishDate = new Date(task.finish_date);
                      const isOverdue = currentDate > finishDate;
                      const taskColor = isOverdue ? "bg-red-500" : "bg-orange-500";

                      return (

                        <li key={task.task_id} className="flex items-center justify-between border p-2 rounded shadow-sm hover:bg-gray-200 transition">
                          <span className={`w-3 h-3 ${taskColor} rounded-full`}></span>
                          <div className="flex-1 ml-2">
                            <div className="font-medium">{task.task_name}</div>
                            <div className="text-sm text-gray-500">
                              Project {task.project_id}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            Due: {new Date(task.finish_date).toLocaleDateString()}
                          </div>
                        </li>
                      );
                    })
                ) : (
                  <li className="text-center text-gray-500">No tasks available</li>
                )}
              </ul>

            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4 h-3/5 mt-4">
            {/* Card 3: Project Summar */}
            <Card className="col-span-2 min-h-full bg-white p-4 overflow-clip">
              <div className="sticky top-0 z-10">
                <div className="flex justify-between items-center gap-2 w-[100%] ">
                  <div className="whitespace-nowrap flex items-center justify-center">
                    <h3 className="text-normal font-semibold">Project Summary</h3>
                  </div>
                  <div className="flex gap-4">
                    {/** they can search instead */}
                    <Select
                      className="w-[25%] ml-auto"
                      value={projects.find(project => project.project_name === selectedProject) || null}
                      onChange={handleProjectChange}
                      getOptionLabel={(project) => project.project_name}
                      getOptionValue={(project) => project.project_name}
                      options={projects}
                      placeholder="Project"
                      isClearable
                      styles={{ container: (provided) => ({ ...provided, width: '200px' }) }}
                    />
                    <Select
                      className="w-[25%] ml-auto"
                      value={projects.find(
                        (project) =>
                          project.employeeDetails &&
                          `${project.employeeDetails.first_name} ${project.employeeDetails.second_name}` === selectedManager
                      ) || null}
                      onChange={handleManagerChange}
                      getOptionLabel={(project) =>
                        project.employeeDetails
                          ? `${project.employeeDetails.first_name} ${project.employeeDetails.second_name}`
                          : "Unknown"
                      }
                      getOptionValue={(project) =>
                        project.employeeDetails
                          ? `${project.employeeDetails.first_name} ${project.employeeDetails.second_name}`
                          : ""
                      }
                      options={projects.filter((project) => project.employeeDetails)}
                      placeholder="Manager"
                      isClearable
                      styles={{ container: (provided) => ({ ...provided, width: '200px' }) }}
                    />
                    <select className="border p-2 rounded w-[25%] ml-auto" value={selectedStatus} onChange={handleStatusChange}>
                      <option value="0">Status</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <button onClick={handleResetFilters} className="bg-gray-200 p-2 rounded ml-auto">
                      Reset
                    </button>
                  </div>
                </div>

                {/* line */}
                <hr className="border-gray-300 my-2" />
              </div>
              {/* Card-style Table Section */}
              <div className="w-full space-y-3 overflow-y-auto max-h-[90%] ">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => {
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
                        className="border shadow-sm p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition cursor-pointer hover:bg-gray-200 transition"
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
                  <div className="text-center text-gray-500">No matching Projects</div>
                )}
              </div>
            </Card>

            {/**card 4 */}
            <Card className="min-h-full p-4 flex flex-col">
              {/* Header */}
              <div className="mb-3 mt-1 flex justify-between items-center">
                <h3 className="text-lg font-semibold">To-Do List</h3>
                <div className="flex gap-2">
                  <button
                    className={`p-2 rounded ${ToDoState === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDoState(1)}
                  >
                    To-Do
                  </button>
                  <button
                    className={`p-2 rounded ${ToDoState === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDoState(2)}
                  >
                    Completed
                  </button>
                  <button
                    className={`p-2 rounded ${ToDoState === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setToDoState(3)}
                  >
                    Deleted
                  </button>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-300 my-2" />

              {/* To-Do Input */}
              {ToDoState === 1 && (
                <div className="flex items-center gap-2 border p-2 rounded">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Add a new todo..."
                    value={newToDoDescription}
                    onChange={(e) => setNewToDoDescription(e.target.value)}
                  />
                  <button className="bg-blue-500 text-white p-2 rounded" onClick={handleAddToDo}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              )}

              {/* To-Do List Container */}

              <ul className="mt-4 space-y-2">
                {ToDoState === 1 && (
                  <>
                    {ToDos.filter(todo => !todo.completed && !todo.deleted).length > 0 ? (
                      ToDos.filter(todo => !todo.completed && !todo.deleted).map(todo => (
                        <li key={todo.todo_id} className="flex items-center justify-between border p-2 rounded shadow-sm">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                          <div className="flex-1 ml-2">
                            <div className="font-medium">{todo.description}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleCompleteToDo(todo.todo_id)} className="text-green-500">
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button onClick={() => handleDeleteToDo(todo.todo_id)} className="text-red-500">
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-500">No To-Dos available</li>
                    )}
                  </>
                )}
                {ToDoState === 2 && (
                  <>
                    {ToDos.filter(todo => todo.completed && !todo.deleted).length > 0 ? (
                      ToDos.filter(todo => todo.completed && !todo.deleted).map(todo => (
                        <li key={todo.todo_id} className="flex items-center justify-between border p-2 rounded shadow-sm">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <div className="flex-1 ml-2">
                            <div className="font-medium">{todo.description}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleUncompleteToDo(todo.todo_id)} className="text-yellow-500">
                              <i className="fa-solid fa-undo"></i>
                            </button>
                            <button onClick={() => handleDeleteToDo(todo.todo_id)} className="text-red-500">
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-500">No Completed To-Dos available</li>
                    )}
                  </>
                )}
                {ToDoState === 3 && (
                  <>
                    {ToDos.filter(todo => todo.deleted).length > 0 ? (
                      ToDos.filter(todo => todo.deleted).map(todo => (
                        <li key={todo.todo_id} className="flex items-center justify-between border p-2 rounded shadow-sm">
                          <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                          <div className="flex-1 ml-2">
                            <div className="font-medium">{todo.description}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleRestoreToDo(todo.todo_id)} className="text-blue-500">
                              <i className="fa-solid fa-redo"></i>
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-500">No Deleted To-Dos available</li>
                    )}
                  </>
                )}
              </ul>
            </Card>
          </div>
        </div>

      </div>
      {isFullscreen && <div className="h-full p-4 ps-0 pb-0">
        <Card className="w-full h-full ">
          <div className="flex justify-between items-center title">
            <div></div>
            <button onClick={toggleFullscreen} className="pe-2 rounded flex items-center">
              <i className="fa-solid fa-arrow-left mr-2"></i>
              <span>Back</span>
            </button>
          </div>

          <hr className="border-gray-300 my-2" />
          <div className='grid grid-cols-2 gap-4 h-full'>

            {
              <>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  dateClick={handleDateClick}
                  height="auto"
                />
              </>
            }
            <div className=''>
              {selectedDate && (
                <div className="mt-4 p-4 border rounded shadow bg-white">
                  <h3 className="text-lg font-semibold">
                    Tasks Due on {selectedDate}
                  </h3>
                  {selectedDateTasks.length > 0 ? (
                    <ul>
                      {selectedDateTasks.map((task) => {
                        const currentDate = new Date();
                        const finishDate = new Date(task.finish_date);
                        const isOverdue = currentDate > finishDate;
                        const completed = task.completed;
                        const taskColor = completed ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-yellow-500";

                        return (
                          <li key={task.task_id} className="flex items-center justify-between border p-2 m-1 rounded shadow-sm">
                            <span className={`w-3 h-3 ${taskColor} rounded-full`}></span>
                            <div className="flex-1 ml-2">
                              <div className="font-medium">{task.task_name}</div>
                              <div className="text-sm text-gray-500">
                                Project {task.project_id}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <i className="fa-solid fa-calendar-alt mr-1"></i>
                              <span>{new Date(task.finish_date).toLocaleDateString()}</span>
                            </div>
                          </li>
                        )

                      })}
                    </ul>
                  ) : (
                    <p>No tasks due on this date.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </Card>
      </div >
      }
    </Layout>
  );
}
