import { BASE_URL } from "./globals";// Change if hosted elsewhere

import { fetchEmployeeDetails } from './fetchEmployeeDetails';
export const fetchProjects = async (employeeId: number, userType: number) => {
    try {
        if (userType === 0) {
            //user is admin
            const response = await fetch(`${BASE_URL}/projects`);
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
            const response = await fetch(`${BASE_URL}/projects/team_leader?team_leader_id=${employeeId}`);
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
            const response = await fetch(`${BASE_URL}/projects/search?employee_id=${employeeId}`);
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

export const fetchProjectsForCompletion = async (employeeId: number, userType: number) => {
    try {
        const response = await fetch(`${BASE_URL}/projects/search?completed=True?authorised=False`);
        const projects = await response.json();

        if (!projects || projects.length === 0) {
            return [];
        }

        // Fetch employee details for each task asynchronously
        const projectsWithEmployees = await Promise.all(
            projects.map(async (project: any) => {
                const employeeDetails = await fetchEmployeeDetails(project.manager_id);
                return { ...project, employeeDetails };
            })
        );

        console.log('Projects with Employee Details:', projectsWithEmployees);
        return projectsWithEmployees;

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
};

export const fetchArchivedProjects = async () => {
    try {
        const response = await fetch('${ BASE_URL }/archived_projects');
        const projects = await response.json();

        if (!projects || projects.length === 0) {
            return [];
        }

        // Fetch employee details for each project asynchronously
        const projectsWithEmployeeDetails = await Promise.all(
            projects.map(async (project: any) => {
                const employeeDetails = await fetchEmployeeDetails(project.team_leader_id);
                return { ...project, employeeDetails };
            })
        );

        console.log('Archived Projects with Employee Details:', projectsWithEmployeeDetails);
        return projectsWithEmployeeDetails;

    } catch (error) {
        console.error('Error fetching archived projects:', error);
        return [];
    }
};
export const fetchProjectTags = async () => {
    try {
        const response = await fetch(`${BASE_URL}/all_tags`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching project tags:', error);
        return [];
    }
}
