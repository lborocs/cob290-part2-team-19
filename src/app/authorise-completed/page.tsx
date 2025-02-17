'use client'
import Layout from "../layout/page"
import React, { useEffect, useState } from "react"
import "./authorise-completed.css"
import Card from "../components/Card"
import { fetchProjectsForCompletion } from "@/api/fetchProjects"
import { fetchTasksForCompletion } from "@/api/fetchTasks"
import { Project, Task } from "@/interfaces/interfaces"
import { fetchUserType } from "@/api/fetchUserType"
import { get_permissions_by_user_type } from "@/api/adminAPI"

type Permissions = {
  [key: string]: boolean;
};


export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loggedInUser, setLoggedInUser] = useState<number>(0)
  const [userType, setUserType] = useState<number>(2)
  const [view, setView] = useState<"tasks" | "projects">("tasks")

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser")
    if (user) {
      const parsedUser = JSON.parse(user)
      setLoggedInUser(parsedUser ?? 0)
      fetchUserType(parsedUser ?? 0).then((result) => {
        if (result.success) {
          setUserType(result.userType ?? 2)
        } else {
          console.error(result.message)
        }
      })
    }
  }, [])

  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (userData && userData.user_type_id !== undefined) {
      get_permissions_by_user_type(userData.user_type_id)
        .then((data) => {
          setPermissions(data);
          setLoading(false); // Set loading to false once permissions are fetched
        })
        .catch((error) => {
          console.error("Error fetching permissions:", error);
        });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectsForCompletion(loggedInUser, userType)
        setProjects(projectData || [])
      } catch (error) {
        console.log("Error fetching completed projects:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await fetchTasksForCompletion(loggedInUser, userType)
        setTasks(taskData || [])
      } catch (error) {
        console.log("Error fetching completed tasks:", error)
      }
    }
    fetchData()
  }, [])

  // Determine if the user has permission for tasks and/or projects
  const hasTaskPermission = permissions?.authorise_completed_tasks;
  const hasProjectPermission = permissions?.authorise_completed_projects;

  // Set the initial view based on the permissions
  useEffect(() => {
    if (hasTaskPermission && !hasProjectPermission) {
      setView("tasks");
    } else if (!hasTaskPermission && hasProjectPermission) {
      setView("projects");
    }
  }, [hasTaskPermission, hasProjectPermission]);

  return (
    <Layout tabName={view === "tasks" ? "Task Authorisation" : "Project Authorisation"} icon={<i className="fa-solid fa-table-columns"></i>}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Toggle Buttons */}
        <div className="flex justify-side p-4">
          <button
            onClick={() => setView("tasks")}
            disabled={!hasTaskPermission}
            className={`rounded-full px-4 py-2 text-white font-semibold mx-2 transition ${
              view === "tasks" ? "bg-blue-500" : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setView("projects")}
            disabled={!hasProjectPermission}
            className={`rounded-full px-4 py-2 text-white font-semibold mx-2 transition ${
              view === "projects" ? "bg-blue-500" : "bg-gray-400 hover:bg-gray-500"
            }`}
          >
            Projects
          </button>
        </div>

        <div className="flex-grow overflow-hidden">
          {view === "tasks" && (
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="p-4 bg-white sticky top-0 z-10 border-b">
                <h3 className="text-lg font-semibold">Completed Tasks (Awaiting Authorisation)</h3>
              </div>
              <div className="overflow-y-auto flex-grow p-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.task_id} className="p-3 border-b">
                      <h4 className="font-semibold">{task.task_name}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(task.finish_date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No completed tasks awaiting authorization</p>
                )}
              </div>
            </Card>
          )}

          {view === "projects" && (
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="p-4 bg-white sticky top-0 z-10 border-b">
                <h3 className="text-lg font-semibold">Completed Projects (Awaiting Authorisation)</h3>
              </div>
              <div className="overflow-y-auto flex-grow p-4">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.project_id} className="p-3 border-b">
                      <h4 className="font-semibold">{project.project_name}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(project.finish_date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No completed projects awaiting authorization</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
