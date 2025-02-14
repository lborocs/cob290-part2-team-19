"use client";
import { useState, useEffect } from "react";
import { TextButton } from "../components/Input/Buttons";
import Layout from "../layout/page";
import React from "react";

interface Project {
  project_id: number;
  project_name: string;
  team_leader: string;
  due_date: string;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    /* Need help with api fetch projects.
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://localhost:3300/projects/search?team_leader_id=${}')
      }
    }
    */
    setProjects([
      {
        project_id: 1,
        project_name: "Project 1",
        team_leader: "Team Lead A",
        due_date: "2023-01-01",
        status: "Completed",
      },
      {
        project_id: 2,
        project_name: "Project 2",
        team_leader: "Team Lead B",
        due_date: "2023-02-01",
        status: "Overdue",
      },
      {
        project_id: 3,
        project_name: "Project 3",
        team_leader: "Team Lead C",
        due_date: "2023-03-01",
        status: "Not Started",
      },
    ]);
  }, []);

  //sort projects by due date
  const sortProjectsByDueDate = () => {
    const sortedProjects = [...projects].sort((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setProjects(sortedProjects);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  //filter projects by search query
  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "All" || project.status === statusFilter)
  );

  return (
    <Layout
      tabName="Projects"
      icon={<i className="fa-solid fa-project-diagram"></i>}
    >
      {/* Grid Layout with 2/3 + 1/3 Column Split */}
      <div className="grid grid-cols-3 gap-6 p-6 h-full">
        {/* Left Column (2/3 width) */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Project Table */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[17em]">
            <h2 className="text-xl font-bold mb-3">Project View</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search projects"
                className="border rounded px-3 py-1 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
                onClick={sortProjectsByDueDate}
              >
                Sort by Due Date
              </button>
              <select
                className="border rounded px-3 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>Status ▼</option>
                <option>Completed</option>
                <option>Overdue</option>
                <option>Not Started</option>
              </select>
            </div>
            <div className="h-[10em] overflow-x-hidden overflow-scroll">
              <table className="min-w-full mt-4">
                <thead className="bg-[#1f2937] text-gray-50 uppercase tracking-wider text-left text-xs">
                  <tr>
                    <th className="table-cell px-3 py-3 text-center font-normal rounded-tl-lg">
                      Select
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-font"></i> Project Name
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-user"></i> Team Lead
                    </th>
                    <th className="table-cell font-normal">
                      <i className="fa-solid fa-calendar-days"></i> Due Date
                    </th>
                    <th className="table-cell text-center font-normal">
                      Status
                    </th>
                    <th className="table-cell text-center font-normal rounded-tr-lg">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.project_id} className="hover:bg-blue-50">
                        <td className="table-cell px-2 py-3 text-center">
                          <input type="checkbox" className="w-6 h-6" />
                        </td>
                        <td className="table-cell px-2 py-3">
                          {project.project_name}
                        </td>
                        <td className="table-cell px-2 py-3">
                          {project.team_leader}
                        </td>
                        <td className="table-cell px-2 py-3 text-gray-500">
                          {project.due_date}
                        </td>
                        <td className="table-cell px-2 py-3 text-center">
                          <span
                            className={
                              project.status === "Completed"
                                ? "text-green-600"
                                : project.status === "Overdue"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="table-cell px-2 py-3 text-center"></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-500"
                      >
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task Notes */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[17em]">
            <h2 className="text-xl font-bold mb-3">Task Notes</h2>
            <div className="border p-3 rounded-md bg-gray-100 text-gray-700">
              <p>Select a task to view its Notes</p>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Card 3 */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[17em]">
            <h2 className="text-xl font-bold mb-0 flex items-center justify-center">
              Task Completion
            </h2>
            <p className="text-gray-700 flex items-center justify-center mb-2">
              This month's tasks
            </p>
            <div className="flex justify-center mb-2">
              <hr className="border w-[75%]" />
            </div>

            <div className="mb-4 flex items-center">
              <p className="text-sm font-medium text-gray-700 w-1/4 text-left">
                Assigned
              </p>
              <div className="w-2/3 bg-gray-200 rounded-full h-4 mx-3">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700 w-1/4 text-right">
                5/10
              </p>
            </div>

            <div className="mb-4 flex items-center">
              <p className="text-sm font-medium text-gray-700 w-1/4 text-left">
                Complete
              </p>
              <div className="w-2/3 bg-gray-200 rounded-full h-4 mx-3">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700 w-1/4 text-right">
                7/10
              </p>
            </div>

            <div className="mb-4 flex items-center">
              <p className="text-sm font-medium text-gray-700 w-1/4 text-left">
                Ongoing
              </p>
              <div className="w-2/3 bg-gray-200 rounded-full h-4 mx-3">
                <div
                  className="bg-yellow-500 h-4 rounded-full"
                  style={{ width: "10%" }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700 w-1/4 text-right">
                1/5
              </p>
            </div>

            <div className="mb-4 flex items-center">
              <p className="text-sm font-medium text-gray-700 w-1/4 text-left">
                Overdue
              </p>
              <div className="w-2/3 bg-gray-200 rounded-full h-4 mx-3">
                <div
                  className="bg-red-500 h-4 rounded-full"
                  style={{ width: "10%" }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700 w-1/4 text-right">
                1/5
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#f3f4f6] shadow-xl border rounded-xl p-5 w-full h-[17em]">
            <h2 className="text-xl font-bold mb-3">Manage Task</h2>
            <div className="flex flex-col gap-2 mt-2">
              <TextButton
                color="bg-yellow-400 text-yellow-700 font-semibold"
                hoverColor="hover:bg-yellow-500 hover:text-yellow-800"
                icon={<i className="fa-solid fa-box-archive mr-2"></i>}
              >
                Archive Task
              </TextButton>
              <TextButton
                color="bg-blue-500 text-blue-200 font-semibold"
                hoverColor="hover:bg-blue-600 hover:text-blue-300"
                icon={<i className="fa-solid fa-pen mr-2"></i>}
              >
                Update Status
              </TextButton>
              <TextButton
                color="bg-green-500 text-green-200 font-semibold"
                hoverColor="hover:bg-green-600 hover:text-green-300"
                icon={<i className="fa-solid fa-check mr-2"></i>}
              >
                Mark Complete
              </TextButton>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
