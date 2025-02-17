"use client";
import Layout from "../layout/page";
import React, { useEffect, useState, useMemo } from "react";
import { fetchTasks } from "@/api/fetchTasks";
import { Task } from "@/interfaces/interfaces";
import { TextButton } from "@/app/components/Input/Buttons";

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInUser] = useState<number>(0);
  const [userType] = useState<number>(2);
  const [responseMessage, setResponseMessage] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "start_date", direction: "asc" });

  // Fetch tasks
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

   // Completes task
  const handleCompleteTask = async (taskId: number) => {
    if (!taskId) {
      console.error("No task ID provided.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3300/complete_task?task_id=${taskId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full API response:", data);

      if (data.message) {
        console.log("Task completed:", data.message);
      } else {
        console.warn("No message field in response:", data);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Logic for sorting task table
  const sortedTasks = useMemo(() => {
    if (!sortConfig.key) return tasks;

    return [...tasks].sort((a, b) => {
      const valueA = (a as Record<string, any>)[sortConfig.key];
      const valueB = (b as Record<string, any>)[sortConfig.key];

      if (valueA == null || valueB == null) return 0;

      if (["start_date", "finish_date"].includes(sortConfig.key)) {
        return sortConfig.direction === "asc"
          ? new Date(valueA).getTime() - new Date(valueB).getTime()
          : new Date(valueB).getTime() - new Date(valueA).getTime();
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }

      return 0;
    });
  }, [tasks, sortConfig]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) return; 

    const sortConfigObj = JSON.parse(event.target.value);

    setSortConfig(sortConfigObj);

    console.log("Sorting by:", sortConfigObj.key, sortConfigObj.direction);
  };

  return (
    <Layout tabName="Tasks" icon={<i className="fa-solid fa-tasks"></i>}>
      <div className="grid grid-cols-3 gap-6 p-6 h-full">
        {/* Left Column (2/3 width) */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Task Table */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[35em]">
            <h3 className="text-xl font-bold mb-3">Task View</h3>
            <div className="overflow-auto max-h-[28em]">
              <div className="flex items-center">
                <label className="mr-2 font-bold">Sort by: </label>
                <select
                  className="border p-2 rounded"
                  onChange={handleSortChange}
                >
                  <option value="">Select...</option>
                  <option value='{"key": "task_name", "direction": "asc"}'>
                    Task Name (A-Z)
                  </option>
                  <option value='{"key": "task_name", "direction": "desc"}'>
                    Task Name (Z-A)
                  </option>
                  <option value='{"key": "start_date", "direction": "asc"}'>
                    Start Date (Oldest First)
                  </option>
                  <option value='{"key": "start_date", "direction": "desc"}'>
                    Start Date (Newest First)
                  </option>
                  <option value='{"key": "finish_date", "direction": "asc"}'>
                    Due Date (Oldest First)
                  </option>
                  <option value='{"key": "finish_date", "direction": "desc"}'>
                    Due Date (Newest First)
                  </option>
                </select>
              </div>
              <div className="border-t-4 border-gray-200 mt-3"></div>
              <table className="w-full mt-2 ">
                <thead className="bg-[#1f2937] text-gray-50 uppercase tracking-wider text-left text-xs">
                  <tr>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-font"></i> Task Id
                    </th>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-font"></i> Task Name
                    </th>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-font"></i> Project Id
                    </th>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-calendar-days"></i> Start Date
                    </th>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-calendar-days"></i> Due Date
                    </th>
                    <th className="table-cell font-semibold p-3">
                      <i className="fa-solid fa-bars-progress"></i> Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {sortedTasks.map((task) => (
                    <tr
                      key={task.task_id}
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
                      <td className="table-cell px-2 py-3 text-center">
                        {Number(task.completed) === 0 ? (
                          <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800">
                            In Progress
                          </span>
                        ) : Number(task.completed) === 1 ? (
                          <span className="px-2 py-1 rounded bg-green-200 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-gray-200 text-gray-800">
                            Not Started
                          </span>
                        )}
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
            <div className="border-t-4 border-gray-200 mt-3"></div>
            {selectedTask ? (
              <div className="flex flex-col gap-3">
                <p className="mt-2">
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
                    window.location.reload();
                  }}
                >
                  Complete Task
                </TextButton>
              </div>
            ) : (
              <p className="mt-2">Select a task to view details.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
