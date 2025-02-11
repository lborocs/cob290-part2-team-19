export const fetchEmployeeDetails = async (employeeId: number) => {
    try {
        const response = await fetch(`http://localhost:3300/employees/${employeeId}/details`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching employee details:', error);
        return null;
    }
};