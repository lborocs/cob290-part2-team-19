// Assuming the shape of data for user types and permissions
export type PermissionType = { [key: string]: boolean };
export type ArchiveDurations = { task: number; project: number; kb: number };

// Base API URL (adjust if needed)
const BASE_URL = "http://localhost:3300"; // Change if hosted elsewhere

export const get_user_types = async (): Promise<{ type_id: number; type_name: string }[]> => {
  const response = await fetch(`${BASE_URL}/get_user_types`);
  if (!response.ok) {
    throw new Error("Failed to fetch user types");
  }
  return await response.json();
};

export const update_permissions = async (userType: number, permissions: PermissionType): Promise<void> => {
  const response = await fetch(`${BASE_URL}/update_permissions/${userType}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(permissions),
  });
  if (!response.ok) {
    throw new Error("Failed to update permissions");
  }
};

export const get_permissions_by_user_type = async (type_id: number): Promise<PermissionType> => {
    try {
      const response = await fetch(`${BASE_URL}/get_permissions_by_user_type/${type_id}`);
  
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
  
      const data = await response.json();
  
      if (!data || Object.keys(data).length === 0) {
        console.warn("Empty permissions received");
        return {};
      }
  
      return data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return {};
    }
  };
  
  

export const get_archive_limits = async (): Promise<ArchiveDurations> => {
  const response = await fetch(`${BASE_URL}/get_archive_limits`);
  if (!response.ok) {
    throw new Error("Failed to fetch archive limits");
  }
  return await response.json();
};

export const update_archive_duration = async (settings: ArchiveDurations): Promise<void> => {
  const response = await fetch(`${BASE_URL}/update_archive_duration`, { // 
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to update archive durations");
  }
};

export const update_user_type = async (userId: number, newUserType: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/change_user_type`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, new_user_type: newUserType }),
  });
  if (!response.ok) {
    throw new Error("Failed to change user type");
  }
};
