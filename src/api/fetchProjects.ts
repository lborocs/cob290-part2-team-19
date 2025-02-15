import { fetchEmployeeDetails } from './fetchEmployeeDetails';

export const fetchProjects = async (employeeId: number, userType: number) => {
    try {
        if (userType === 0) {
            //user is admin
            const response = await fetch(`http://localhost:3300/projects`);
            const projects = await response.json();

            if (!projects || projects.length === 0) {
                return [];
            }
            // need the tl details for each project
            const projectsWithEmployeeDetails = await Promise.all(

                projects.map(async (project: any) => {
                    const employeeDetails = await fetchEmployeeDetails(project.team_leader_id);
                    return { ...project, employeeDetails };
                })
            );
            return projectsWithEmployeeDetails;
        }
        else if (userType === 1) {
            //user is tl so get projects they manage 
            const response = await fetch(`http://localhost:3300/projects/team_leader?team_leader_id=${employeeId}`);
            const projects = await response.json();

            if (!projects || projects.length === 0) {
                return [];
            }

            // we know who the tl is
            const employeeDetails = await fetchEmployeeDetails(employeeId);

            // Add the team leader's details to each project
            const projectsWithEmployeeDetails = projects.map((project: any) => ({
                ...project,
                employeeDetails
            }));

            return projectsWithEmployeeDetails;
        }
        else if (userType === 2) {
            //user is normal
            const response = await fetch(`http://localhost:3300/projects/search?employee_id=${employeeId}`);
            const projects = await response.json();

            if (!projects || projects.length === 0) {
                return [];
            }
            // need the tl details for each project
            const projectsWithEmployeeDetails = await Promise.all(

                projects.map(async (project: any) => {
                    const employeeDetails = await fetchEmployeeDetails(project.team_leader_id);
                    return { ...project, employeeDetails };
                })
            );
            //console.log(projectsWithEmployeeDetails);
            return projectsWithEmployeeDetails;
        }
    } catch (error) {
        console.log('Error fetching projects:', error);
        return [];
    }
};