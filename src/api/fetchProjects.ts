import { fetchEmployeeDetails } from './fetchEmployeeDetails';

export const fetchProjects = async () => {
    try {
        const response = await fetch('http://localhost:3300/projects/search');
        const projects = await response.json();

        // Fetch employee details for each project
        const projectsWithEmployeeDetails = await Promise.all(
            projects.map(async (project: any) => {
                const employeeDetails = await fetchEmployeeDetails(project.team_leader_id);
                return { ...project, employeeDetails };
            })
        );

        return projectsWithEmployeeDetails;
    } catch (error) {
        console.log('Error fetching projects:', error);
        return [];
    }
};