export interface EmployeeDetails {
    employee_id: number;
    employee_email: string;
    first_name: string;
    second_name: string;
    user_type_id: number;
    type_name: string;
}

export interface Project {
    project_id: number;
    project_name: string;
    team_leader_id: number;
    start_date: Date;
    finish_date: Date;
    authorised_by: string;
    authorised: boolean;
    completed: boolean;
    status: string;
    dueDate: string;
    archived: boolean;
    employeeDetails: EmployeeDetails;
}

export interface Task {
    task_id: number;
    task_name: string;
    project_id: number;
    description: string;
    start_date: Date;
    finish_date: Date;
    completed: boolean;
    completed_date: Date;
}