export type PermissionType = { [key: string]: boolean }
export type ArchiveDurations = { task: number; project: number; kb: number }
export type User = { id: number; name: string }

// Base API URL (adjust if needed)
import { BASE_URL } from "./globals";

export const get_user_types = async (): Promise<
  { type_id: number; type_name: string }[]
> => {
  const response = await fetch(`${BASE_URL}/get_user_types`)
  if (!response.ok) {
    throw new Error("Failed to fetch user types")
  }
  return await response.json()
}

export const update_permissions = async (
  userType: number,
  permissions: PermissionType
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/update_permissions/${userType}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(permissions),
  })
  if (!response.ok) {
    throw new Error("Failed to update permissions")
  }
}

export const get_permissions_by_user_type = async (
  type_id: number
): Promise<PermissionType> => {
  try {
    const response = await fetch(
      `${BASE_URL}/get_permissions_by_user_type/${type_id}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch permissions")
    }

    const data = await response.json()

    if (!data || Object.keys(data).length === 0) {
      console.warn("Empty permissions received")
      return {}
    }

    return data
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return {}
  }
}

export const get_archive_limits = async (): Promise<ArchiveDurations> => {
  try {
    const durations = await fetch(`${BASE_URL}/get_archive_limits`)
    if (!durations.ok) {
      throw new Error("Failed to fetch archive limits")
    }
    // Parse the JSON responses
    const taskData = await durations.json()
    console.log("Archive durations updated successfully")

    return taskData
  } catch (error) {
    console.error("Error fetching archive durations:", error)
    throw error
  }
}

export const update_archive_durations = async (durations: {
  task: number
  project: number
  kb: number
}) => {
  try {
    const response = await fetch(`${BASE_URL}/update_archive_durations`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(durations),
    })

    if (!response.ok) {
      const errorData = await response.json()
      // Include durations in the error message
      throw new Error(
        `Failed to update archive durations. Task: ${
          durations.task
        }, Project: ${durations.project}, KB: ${durations.kb}. Error: ${
          errorData.error || "Unknown error"
        }`
      )
    }

    console.log("Archive durations updated successfully")
  } catch (error) {
    console.error("Error:", error)
    throw new Error(
      `Failed to update archive durations. Task: ${durations.task}, Project: ${durations.project}, KB: ${durations.kb}.`
    )
  }
}

export const update_user_type = async (
  selectedUser: number,
  newUserType: number
): Promise<void> => {
  try {
    console.log(selectedUser);
    console.log(newUserType);
    const response = await fetch(`${BASE_URL}/change_user_type`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: selectedUser,
        new_user_type: newUserType,
      }),
    })
    if (!response.ok) {
      throw new Error("Failed to change user type")
    }
    console.log("Employee type updated successfully")
  } catch (error) {
    console.error("Error:", error)
    throw new Error(`Failed to update employee type`)
  }
}

// In your api/adminAPI.ts
export const get_users = async () => {
  try {
    const response = await fetch(`${BASE_URL}/get_users`) // Adjust the endpoint as needed
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    const data = await response.json()
    return data // Assuming the data is an array of users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}
