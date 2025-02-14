export const fetchToDo = async (employeeId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/get_todos?employee_id=${employeeId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching tasks:', error);
        return null;
    }
};