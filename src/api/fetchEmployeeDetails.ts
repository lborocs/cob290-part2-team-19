import { BASE_URL } from "./globals";// Change if hosted elsewhere

export const fetchEmployeeDetails = async (employeeId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/employees/${employeeId}/details`);
        const data = await response.json();
        //console.log('Employee details:', data);
        return data;
    } catch (error) {
        console.log('Error fetching employee details:', error);
        return null;
    }
};