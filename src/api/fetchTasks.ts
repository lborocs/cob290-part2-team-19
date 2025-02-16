import { fetchEmployeeDetails } from './fetchEmployeeDetails'; // Ensure this function exists and is correctly implemented

export const fetchTasks = async (employeeId: number, userType: number) => {
    try {
        let url = '';

        if (userType === 0) {
            // User is admin
            url = `http://localhost:3300/tasks`;
        } else if (userType === 1) {
            // User is a team leader, so get tasks they manage
            url = `http://localhost:3300/tasks/team_leader?team_leader_id=${employeeId}`;
        } else if (userType === 2) {
            // User is a normal employee
            url = `http://localhost:3300/tasks/search?employee_id=${employeeId}`;
        }

        const response = await fetch(url);
        const tasks = await response.json();
        if (!tasks || tasks.length === 0) {
            return [];
        }

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
};



export const fetchTasksForCompletion = async (employeeId: number, userType: number) => {
    try {

        const response = await fetch(`http://localhost:3300/tasks/search?completed=True?authorised=False`);
        const tasks = await response.json();

        if (!tasks || tasks.length === 0) {
            return [];
        }

        // Fetch employee details for each task asynchronously
        const tasksWithEmployees = await Promise.all(
            tasks.map(async (task: any) => {
                const employeeDetails = await fetchEmployeeDetails(task.employee_id);
                return { ...task, employeeDetails };
            })
        );

        console.log('Tasks with Employee Details:', tasksWithEmployees);
        return tasksWithEmployees;

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
};



// Function to fetch employee details for a given task
export const fetchEmployeesForTask = async (taskId: number) => {
    try {
        const response = await fetch(`/employees/tasks?task_id=${taskId}`);
        const employees = await response.json();
        return employees;
    } catch (error) {
        console.log("Error fetching employee data:", error);
        return [];
    }
};