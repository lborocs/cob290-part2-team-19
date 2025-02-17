// components/Sidebar.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { get_permissions_by_user_type } from "@/api/adminAPI"; // Import the permissions fetching function

type Permissions = {
  [key: string]: boolean;
};

const Loading = () => {
  return (
    <nav className="fixed top-0 left-0 z-[0] bg-[#374151] w-[15em] p-4 h-[100vh] sidebar">
      <div className="flex flex-col items-start mt-[4em] gap-2">
        {/* Empty space for skeleton sidebar */}
      </div>
    </nav>
  );
};

// Define LinkDefinition (static)
const LinkDefinition = {
  dash: { name: "Dashboard", href: "/dashboard", icon: <i className="fa-solid fa-table-columns" /> },
  proj: { name: "Projects", href: "/projects", icon: <i className="fa-solid fa-project-diagram" /> },
  task: { name: "Tasks", href: "/tasks", icon: <i className="fa-solid fa-tasks" /> },
  know: { name: "Knowledge Base", href: "/knowledge-base", icon: <i className="fa-solid fa-book" /> },
  "pro+": { name: "New Project", href: "/projects/new", icon: <i className="fa-regular fa-square-plus" /> },
  "task+": { name: "New Task", href: "/tasks/new", icon: <i className="fa-regular fa-square-plus" /> },
  authCompleted: { name: "Authorise Completed", href: "/authorise-completed", icon: <i className="fa-regular fa-square-plus" /> },
  admin: { name: "Admin", href: "/admin", icon: <i className="fa-solid fa-user-shield" /> },
  taskArchive: { name: "Tasks Archive", href: "/tasks/archived", icon: <i className="fa-solid fa-tasks" /> },
  kbArchive: { name: "Knowledge Base Archive", href: "/knowledgebase/archived", icon: <i className="fa-solid fa-tasks" /> },
  projectArchive: { name: "Projects Archive", href: "/projects/archived", icon: <i className="fa-solid fa-tasks" /> },
};

// Define the function to generate navigation dynamically based on permissions
const generateNavigation = (permissions: Permissions) => {
  const allowedLinks = [];

  // Add links based on permissions
  allowedLinks.push(LinkDefinition["dash"]);
  allowedLinks.push(LinkDefinition["proj"]);
  allowedLinks.push(LinkDefinition["task"]);
  allowedLinks.push(LinkDefinition["know"]);
  if (permissions["new_project"]) allowedLinks.push(LinkDefinition["pro+"]);
  if (permissions["new_task"]) allowedLinks.push(LinkDefinition["task+"]);
  if (permissions["access_admin"]) allowedLinks.push(LinkDefinition["admin"]);
  if (permissions["view_task_archive"]) allowedLinks.push(LinkDefinition["taskArchive"]);
  if (permissions["view_project_archive"]) allowedLinks.push(LinkDefinition["projectArchive"]);
  if (permissions["view_kb_archive"]) allowedLinks.push(LinkDefinition["kbArchive"]);
  if (permissions["authorise_completed_tasks"] || permissions["authorise_completed_projects"]) allowedLinks.push(LinkDefinition["authCompleted"]);

  return allowedLinks;
};

const Sidebar = () => {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state

  useEffect(() => {
    console.log("1 - useEffect triggered"); // Log to check if useEffect is triggered
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    console.log("2 - userData:", JSON.stringify(userData)); // Log to check the contents of userData

    if (userData && userData.user_type_id !== undefined) {
      console.log("3 - Fetching permissions for user_type_id:", userData.user_type_id);
      get_permissions_by_user_type(userData.user_type_id)
        .then((data) => {
          console.log("4 - Permissions fetched:", data); // Log permissions fetched from API
          setPermissions(data);
          setLoading(false); // Set loading to false once permissions are fetched
        })
        .catch((error) => {
          console.error("Error fetching permissions:", error); // Log any errors during fetch
        });
    } else {
      console.log("5 - userData not found or user_type_id is undefined");
    }
  }, []);

  // If permissions are still being fetched, show the skeleton sidebar using the Loading component
  if (loading) {
    return <Loading />;
  }

  console.log("6 - Final permissions state:", permissions); // Log the permissions object after it's set

  // Generate the navigation based on the permissions
  const filteredNavigation = generateNavigation(permissions);

  return (
    <nav className="fixed top-0 left-0 z-[0] bg-[#374151] w-[15em] p-4 h-[100vh] sidebar">
      <div className="flex flex-col items-start mt-[4em] gap-2">
        {filteredNavigation.map((item) => (
          <div key={item.name} className="nav-link">
            <Link href={item.href} className="text-blue-50 text-lg">
              <span className="mr-1">{item.icon}</span>
              {item.name}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
