// Assuming the shape of data for user types and permissions
export type PermissionType = { [key: string]: boolean };
export type ArchiveSettings = { task: number; project: number; kb: number };

export const get_user_types = async (): Promise<{ type_id: number; type_name: string }[]> => {
  const response = await fetch("/get_user_types");
  if (!response.ok) {
    throw new Error("Failed to fetch user types");
  }
  return await response.json();
};

export const update_permissions = async (
    userType: number, permissions: PermissionType) => {
    const response = await fetch(`/update_permissions/${userType}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(permissions)
    })
    if (!response.ok) {
    throw new Error("Failed to update permissions");
  }
};

export const get_archive_settings = async (): Promise<ArchiveSettings> => {
  const response = await fetch("/get_archive_settings");
  if (!response.ok) {
    throw new Error("Failed to fetch archive settings");
  }
  return await response.json();
};

export const update_archive_settings = async (settings: ArchiveSettings): Promise<void> => {
  const response = await fetch("update_archive_duration", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to update archive settings");
  }
};

export const update_user_type = async (
  userId: number,
  newUserType: number
): Promise<void> => {
  const response = await fetch("/change_user_type", {
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