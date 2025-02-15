const API_BASE_URL = "http://localhost:3300"; // Adjust if needed

export interface ArchiveRequest {
  task_id?: number;
  project_id?: number;
  post_id?: number;
  archived_date: string;
  future_autodelete_date?: string;
  manager_id?: number;
}

// Function to archive a task
export const archiveTask = async (task_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/archive_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id })
    });
    return await response.json();
  } catch (error) {
    console.error("Error archiving task:", error);
    throw error;
  }
};

// Function to archive a project
export const archiveProject = async (
  project_id: number,
  manager_id: number
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/archive_project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id, manager_id })
    });
    return await response.json();
  } catch (error) {
    console.error("Error archiving project:", error);
    throw error;
  }
};

// Function to archive a knowledge base post
export const archiveKBPost = async (post_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/archive_kb_post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id })
    });
    return await response.json();
  } catch (error) {
    console.error("Error archiving knowledge base post:", error);
    throw error;
  }
};

// Function to check if a project is archived
export const isProjectArchived = async (project_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/is_project_archived?project_id=${project_id}`);
    return await response.json();
  } catch (error) {
    console.error("Error checking if project is archived:", error);
    throw error;
  }
};

// Function to check if a task is archived
export const isTaskArchived = async (task_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/is_task_archived?task_id=${task_id}`);
    return await response.json();
  } catch (error) {
    console.error("Error checking if task is archived:", error);
    throw error;
  }
};

// Function to check if a knowledge base post is archived
export const isPostArchived = async (post_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/is_post_archived?post_id=${post_id}`);
    return await response.json();
  } catch (error) {
    console.error("Error checking if post is archived:", error);
    throw error;
  }
};
