import { BASE_URL } from "./globals";// Change if hosted elsewhere


export const fetchToDo = async (employeeId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/get_todos?employee_id=${employeeId}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.log('Error fetching tasks:', error);
        return null;
    }
};