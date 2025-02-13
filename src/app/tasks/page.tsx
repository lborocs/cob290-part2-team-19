import Layout from "../layout/page";
import React from "react";

export default function TasksPage() {
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
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 1</td>
                    <td className="table-cell px-2 py-3">Team Lead A</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-01-01
                    </td>
                    <td className="table-cell px-2 py-3 text-green-600 text-center">
                      Completed
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 2</td>
                    <td className="table-cell px-2 py-3">Team Lead B</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-02-01
                    </td>
                    <td className="table-cell px-2 py-3 text-yellow-600 text-center">
                      Unfinished
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="table-cell px-2 py-3 text-center">
                      <input type="checkbox" className="w-6 h-6" />
                    </td>
                    <td className="table-cell px-2 py-3">Project 3</td>
                    <td className="table-cell px-2 py-3">Team Lead C</td>
                    <td className="table-cell px-2 py-3 text-gray-500">
                      2023-03-01
                    </td>
                    <td className="table-cell px-2 py-3 text-gray-500 text-center">
                      Not Started
                    </td>
                    <td className="table-cell px-2 py-3 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
