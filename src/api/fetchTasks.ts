export const fetchTasks = async (employeeId: number, userType: number) => {
    try {
        const response = await fetch(`http://localhost:3300/tasks/search?employee_id=${employeeId}&user_type=${userType}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching tasks:', error);
        return null;
    }
};