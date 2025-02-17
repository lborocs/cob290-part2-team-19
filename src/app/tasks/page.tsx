"use client";
import Layout from "../layout/page";
import React, { useEffect, useState } from "react";
import { fetchTasks } from "@/api/fetchTasks";
import { Task } from "@/interfaces/interfaces";
import { TextButton } from "@/app/components/Input/Buttons";

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInUser] = useState<number>(0);
  const [userType] = useState<number>(2);
  const [responseMessage, setResponseMessage] = useState("");

  //getting tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTasks(loggedInUser, userType);
        setTasks(data || []);
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        console.log("User Data T:", userData); // Debugging log
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCompleteTask = async (taskId: number) => {
    if (!taskId) {
      console.error("No task ID provided.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3300/complete_task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id: taskId }),
      });

      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response JSON
      const data = await response.json();

      // Log the full response to see what's inside
      console.log("Full API response:", data);

      // Check if the message exists
      if (data.message) {
        console.log("Task completed:", data.message);
      } else {
        console.warn("No message field in response:", data);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <Layout tabName="Tasks" icon={<i className="fa-solid fa-tasks"></i>}>
      {/* Grid Layout with 2/3 + 1/3 Column Split */}
      <div className="grid grid-cols-3 gap-6 p-6 h-full">
        {/* Left Column (2/3 width) */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Task Table */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[35em]">
            <h2 className="text-xl font-bold mb-3">Task View</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search task"
                className="border rounded px-3 py-1 text-sm"
              />
              <button className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">
                Sort by Due Date
              </button>
              <select className="border rounded px-3 py-1 text-sm">
                <option>Status ▼</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Overdue</option>
              </select>
            </div>
            <div className="overflow-auto max-h-[28em]">
              <table className="w-full">
                <thead className="bg-[#1f2937] text-gray-50 uppercase tracking-wider text-left text-xs">
                  <tr>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-font"></i> Task Id
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-font"></i> Task Name
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-font"></i> Project Id
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-calendar-days"></i> Start Date
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-calendar-days"></i> Due Date
                    </th>
                    <th className="table-cell text-center font-normal">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {tasks.map((task, index) => (
                    <tr
                      key={index}
                      className="bg-gray-50 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleRowClick(task)}
                    >
                      <td className="table-cell px-2 py-3">{task.task_id}</td>
                      <td className="table-cell px-2 py-3">{task.task_name}</td>
                      <td className="table-cell px-2 py-3">
                        {task.project_id}
                      </td>
                      <td className="table-cell px-2 py-3 text-gray-500">
                        {new Date(task.start_date).toLocaleDateString()}
                      </td>
                      <td className="table-cell px-2 py-3 text-gray-500">
                        {new Date(task.finish_date).toLocaleDateString()}
                      </td>
                      <td className="table-cell px-2 py-3 text-yellow-600 text-center">
                        {task.completed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white shadow-xl border rounded-xl p-5 h-[35em]">
            <h2 className="text-xl font-bold mb-3">Task Details</h2>
            {/* Display task details if a task is selected */}
            {selectedTask ? (
              <div className="flex flex-col gap-3">
                <p>
                  <strong>Task Name:</strong> {selectedTask.task_name}
                </p>
                <p>
                  <strong>Project:</strong> {selectedTask.project_id}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(selectedTask.start_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {new Date(selectedTask.finish_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {selectedTask.completed}
                </p>
                <p>
                  <strong>Description:</strong> {selectedTask.description}
                </p>
                <TextButton
                  style={{ width: "100%", fontSize: "1.5em" }}
                  icon={<i className="fa-solid fa-file-circle-plus mr-2"></i>}
                  color="bg-blue-500 text-[#e6f3f9]"
                  hoverColor="hover:bg-blue-400 hover:text-white"
                  callback={() => {
                    handleCompleteTask(selectedTask.task_id);
                  }}
                >
                  Complete Task
                </TextButton>
              </div>
            ) : (
              <p>Select a task to view details.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
