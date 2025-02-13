"use client"
import Layout from "../layout/page"
import React, { useEffect, useState } from "react"
import Card from "../components/Card"
import {
  get_user_types,
  update_permissions,
  update_archive_duration,
  update_user_type,
  get_archive_limits,
  get_permissions_by_user_type,
  ArchiveDurations,
  PermissionType,
} from "@/api/adminAPI"

type User = {
  id: number
  name: string
}

export default function AdminDashboard() {
  const [userTypes, setUserTypes] = useState<
    { type_id: number; type_name: string }[]
  >([])
  const [selectedUserType, setSelectedUserType] = useState<number | null>(null)
  const [permissions, setPermissions] = useState<PermissionType>({})
  const [initialPermissions, setInitialPermissions] = useState<PermissionType>(
    {}
  ) // Stores initial empty state
  const [archiveSettings, setArchiveSettings] = useState<ArchiveDurations>({
    task: 365,
    project: 365,
    kb: 365,
  })
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [newUserType, setNewUserType] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_user_types()
        setUserTypes(data || [])
      } catch (error) {
        console.error("Error fetching user types:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchArchiveSettings = async () => {
      try {
        const data = await get_archive_limits()
        setArchiveSettings(data || [])
      } catch (error) {
        console.error("Error fetching archive settings:", error)
      }
    }
    fetchArchiveSettings()
  }, [])

  useEffect(() => {
    if (selectedUserType !== null) { // ✅ This now allows `0`
      const fetchPermissions = async () => {
        try {
          const perms = await get_permissions_by_user_type(selectedUserType);
          console.log("Fetched Permissions for Type", selectedUserType, ":", perms);
          setPermissions(perms || {});
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      };
      fetchPermissions();
    } else {
      console.log("Resetting permissions to initial state");
      setPermissions(initialPermissions); // ✅ Reset when no type is selected
    }
  }, [selectedUserType]);
  
  

  const handlePermissionChange = (perm: string, value: boolean) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [perm]: value,
    }))
  }

  const handleUpdatePermissions = async () => {
    if (selectedUserType !== null) {
      await update_permissions(selectedUserType, permissions)
      alert("Permissions updated successfully!")
    }
  }

  const handleUpdateArchive = async () => {
    await update_archive_duration(archiveSettings)
    alert("Archive settings updated!")
  }

  const handleChangeUserType = async () => {
    if (selectedUser && newUserType) {
      await update_user_type(selectedUser, newUserType)
      alert("User role updated!")
    }
  }

  return (
    <Layout
      tabName='Admin Panel'
      icon={<i className='fa-solid fa-user-shield'></i>}
    >
      <div className='p-4 grid grid-cols-2 gap-4'>
        {/* User Permissions Section */}
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>User Permissions</h2>
          <select
            onChange={(e) =>
              setSelectedUserType(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className='border p-2 w-full mt-2'
          >
            <option value=''>Select User Type</option>{" "}
            {/* Allows clearing selection */}
            {userTypes.map((type) => (
              <option key={type.type_id} value={type.type_id}>
                {type.type_name}
              </option>
            ))}
          </select>

          <div className='mt-4'>
            {Object.keys(permissions).length > 0 ? (
              Object.entries(permissions).map(([perm, value]) => (
                <label key={perm} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={Boolean(value)}
                    onChange={(e) =>
                      handlePermissionChange(perm, e.target.checked)
                    }
                    className='mr-2'
                  />
                  {perm
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </label>
              ))
            ) : (
              <p className='text-gray-500'>
                Select a user type to view permissions.
              </p>
            )}
          </div>

          <button
            className='mt-4 bg-blue-500 text-white p-2 rounded'
            onClick={handleUpdatePermissions}
            disabled={selectedUserType === null}
          >
            Update Permissions
          </button>
        </Card>

        {/* Archive Duration Settings */}
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>Archive Duration</h2>
          <div className='mt-2'>
            <label>Task Archive Days</label>
            <input
              type='number'
              value={archiveSettings.task}
              onChange={(e) =>
                setArchiveSettings({
                  ...archiveSettings,
                  task: Number(e.target.value),
                })
              }
              className='border p-2 w-full'
            />
          </div>
          <div className='mt-2'>
            <label>Project Archive Days</label>
            <input
              type='number'
              value={archiveSettings.project}
              onChange={(e) =>
                setArchiveSettings({
                  ...archiveSettings,
                  project: Number(e.target.value),
                })
              }
              className='border p-2 w-full'
            />
          </div>
          <div className='mt-2'>
            <label>Knowledge Base Archive Days</label>
            <input
              type='number'
              value={archiveSettings.kb}
              onChange={(e) =>
                setArchiveSettings({
                  ...archiveSettings,
                  kb: Number(e.target.value),
                })
              }
              className='border p-2 w-full'
            />
          </div>
          <button
            className='mt-4 bg-blue-500 text-white p-2 rounded'
            onClick={handleUpdateArchive}
          >
            Update Archive Duration
          </button>
        </Card>

        {/* Change User Type */}
        <Card className='p-4 col-span-2'>
          <h2 className='text-lg font-semibold'>Change User Role</h2>
          <div className='mt-2'>
            <label>Select User</label>
            <select
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className='border p-2 w-full'
            >
              <option value=''>Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className='mt-2'>
            <label>New User Type</label>
            <select
              onChange={(e) => setNewUserType(Number(e.target.value))}
              className='border p-2 w-full'
            >
              <option value=''>Select User Type</option>
              {userTypes.map((type) => (
                <option key={type.type_id} value={type.type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>
          <button
            className='mt-4 bg-blue-500 text-white p-2 rounded'
            onClick={handleChangeUserType}
          >
            Update User Type
          </button>
        </Card>
      </div>
    </Layout>
  )
}
