export const fetchTasks = async (employeeId: number, userType: number) => {
    try {
        if (userType === 0) {
            //user is admin
            const response = await fetch(`http://localhost:3300/tasks`);
            const tasks = await response.json();

            if (!tasks || tasks.length === 0) {
                return [];
            }
            return tasks;
        }
        else if (userType === 1) {
            //user is tl so get tasks they manage 
            const response = await fetch(`http://localhost:3300/tasks/team_leader?team_leader_id=${employeeId}`);
            const tasks = await response.json();

            if (!tasks || tasks.length === 0) {
                return [];
            }
            console.log('Tasks:', tasks);
            return tasks;
        }
        else if (userType === 2) {
            //user is normal
            const response = await fetch(`http://localhost:3300/tasks/search?employee_id=${employeeId}`);
            const tasks = await response.json();

            if (!tasks || tasks.length === 0) {
                return [];
            }
            return tasks;
        }
    } catch (error) {
        console.log('Error fetching tasks:', error);
        return null;
    }
};