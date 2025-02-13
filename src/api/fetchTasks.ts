export const fetchTasks = async (employeeId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/tasks/search?employee_id=${employeeId}`);
        const data = await response.json();
        console.log('tasks:', data);
        return data;
    } catch (error) {
        console.log('Error fetching tasks:', error);
        return null;
    }
};