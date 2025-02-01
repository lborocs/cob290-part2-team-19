import Layout from '../layout/page';
import React from 'react';
import './dashboard.css';


export default function Dashboard() {
  return (
    <Layout tabName={"Dashboard"} icon={<i className="fa-solid fa-table-columns"></i>}>
      <div className="h-full p-4">
        {/* Top Row: Two Cards (Each 1/2 Width, 1/3 Height) */}
        <div className="grid grid-cols-2 gap-4 h-1/3">
          {/* Card 1: Empty Placeholder */}
          <div className="card bg-white shadow rounded min-h-full"></div>

          {/* Card 2: Upcoming Tasks */}
          <div className="card bg-white shadow rounded min-h-full p-4 flex flex-col">
            {/* Header with Fullscreen Icon */}
            <div className="pb-2 flex justify-between items-center title">
              <h3 className="text-lg font-semibold pt-2">Upcoming</h3>
              <button className="pe-2 rounded ">
                <i className="fa-solid fa-expand hover:bg-gray-200 transition"></i> {/* Fullscreen Icon */}
              </button>
            </div>

            {/* Divider */}
            <hr className="border-gray-300 my-2" />

            {/* Upcoming Task List */}
            <ul className="space-y-3 pe-2 ">
              <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <div className="flex-1 ml-2">
                  <div className="font-medium">Design Review</div>
                  <div className="text-sm text-gray-500">Manager 1</div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fa-solid fa-calendar-alt mr-1"></i>
                  <span>30/10/24</span>
                </div>
              </li>

              <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <div className="flex-1 ml-2">
                  <div className="font-medium">Team Meeting</div>
                  <div className="text-sm text-gray-500">Manager 2</div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fa-solid fa-calendar-alt mr-1"></i>
                  <span>31/10/24</span>
                </div>
              </li>

              <li className="flex items-center justify-between border p-2 rounded shadow-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <div className="flex-1 ml-2">
                  <div className="font-medium">Documentation</div>
                  <div className="text-sm text-gray-500">Manager 1</div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fa-solid fa-calendar-alt mr-1"></i>
                  <span>01/11/24</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Row: Two Cards (2/3 & 1/3 Width, 2/3 Height) */}
        <div className="grid grid-cols-3 gap-4 h-2/3 mt-4">
          {/* Card 3: Project Summary + Table (2/3 Width, 2/3 Height) */}
          <div className="card shadow rounded col-span-2 min-h-full bg-white p-4">
            {/* Project Summary Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Summary</h3>
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

            {/* Divider */}
            <hr className="border-gray-300 my-2" />

            {/* Table Section */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Project Name</th>
                    <th className="border p-2">Manager</th>
                    <th className="border p-2">Due Date</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add table rows dynamically here */}

                  {/* Sample Table Rows start*/}
                  <tr>
                    <td className="border p-2">Project Alpha</td>
                    <td className="border p-2">John Doe</td>
                    <td className="border p-2">2023-12-01</td>
                    <td className="border p-2">In Progress</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Project Beta</td>
                    <td className="border p-2">Jane Smith</td>
                    <td className="border p-2">2024-01-15</td>
                    <td className="border p-2">Completed</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Project Gamma</td>
                    <td className="border p-2">Alice Johnson</td>
                    <td className="border p-2">2024-03-22</td>
                    <td className="border p-2">In Progress</td>
                  </tr>
                  {/* Sample Table Rows end*/}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Empty Placeholder (1/3 Width, 2/3 Height) */}
          {/* Card 2: To-Do List */}
          <div className="card bg-white shadow rounded min-h-full p-4 flex flex-col">
            {/* Header */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">To-Do List</h3>
              <div className="flex gap-4">
                <select className="border p-2 rounded">
                  <option value="today">Today</option>
                  <option value="month">This Month</option>
                  <option value="all">All Tasks</option>
                </select>
                <select className="border p-2 rounded">
                  <option value="all">All Projects</option>
                  <option value="project1">Project 1</option>
                  <option value="project2">Project 2</option>
                  <option value="project3">Project 3</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-300 my-2" />

            {/* To-Do Input */}
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

            {/* To-Do List Container */}
            <ul className="mt-4 space-y-2">
              {/* Dynamically generated To-Do Items go here */}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
