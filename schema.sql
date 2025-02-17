-- Create UserTypes Table
CREATE TABLE IF NOT EXISTS UserTypes (
    type_id INT PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL UNIQUE
);

-- Insert default user types
INSERT IGNORE INTO UserTypes (type_id, type_name) VALUES
    (0, 'Manager'),
    (1, 'ProjectLead'),
    (2, 'Employee');

-- Create Employees Table
CREATE TABLE IF NOT EXISTS Employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    second_name VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    user_type_id INT NOT NULL,
    current_employee BOOLEAN NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES UserTypes(type_id)
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS Projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(255) NOT NULL,
    team_leader_id INT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_date DATETIME,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    authorised_by INT,
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id),
    FOREIGN KEY (team_leader_id) REFERENCES Employees(employee_id)
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS Tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(255) NOT NULL,
    assigned_employee INT NOT NULL,
    project_id INT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_date DATETIME,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (assigned_employee) REFERENCES Employees(employee_id)
);

-- Create PrerequisiteTasks Table
CREATE TABLE IF NOT EXISTS PrerequisiteTasks (
    task_id INT NOT NULL,
    prerequisite_task_id INT NOT NULL,
    PRIMARY KEY (task_id, prerequisite_task_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (prerequisite_task_id) REFERENCES Tasks(task_id)
);

-- Create ToDo Table
CREATE TABLE IF NOT EXISTS ToDo (
    employee_id INT NOT NULL,
    todo_id INT NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    future_autodelete_date DATETIME,
    PRIMARY KEY (employee_id, todo_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Create Tags Table
CREATE TABLE IF NOT EXISTS Tags (
    tag_name VARCHAR(255) PRIMARY KEY
);

-- Create ProjectTags Table
CREATE TABLE IF NOT EXISTS ProjectTags (
    project_id INT NOT NULL,
    tag_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (project_id, tag_name),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (tag_name) REFERENCES Tags(tag_name)
);

-- Create EmployeeTasks Table
CREATE TABLE IF NOT EXISTS EmployeeTasks (
    task_id INT NOT NULL,
    employee_id INT NOT NULL,
    PRIMARY KEY (task_id, employee_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Create EmployeeProjects Table
CREATE TABLE IF NOT EXISTS EmployeeProjects (
    project_id INT NOT NULL,
    employee_id INT NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Create KnowledgeBaseCategories Table
CREATE TABLE IF NOT EXISTS KnowledgeBaseCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) UNIQUE NOT NULL
);

-- Create KnowledgeBase Table
CREATE TABLE IF NOT EXISTS KnowledgeBase (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    category_id INT,
    deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (category_id) REFERENCES KnowledgeBaseCategories(category_id)
);

-- Create Permissions Table
CREATE TABLE IF NOT EXISTS Permissions (
    user_type INT PRIMARY KEY,
    new_project BOOLEAN,
    new_task BOOLEAN,
    edit_project BOOLEAN,
    edit_task BOOLEAN,
    create_knowledgebase_post BOOLEAN,
    edit_knowledgebase_post BOOLEAN,
    delete_knowledgebase_post BOOLEAN,
    access_admin BOOLEAN,
    view_task_archive BOOLEAN,
    view_project_archive BOOLEAN,
    view_knowledgebase_archive BOOLEAN,
    authorise_completed_tasks BOOLEAN,
    authorise_completed_projects BOOLEAN,
    FOREIGN KEY (user_type) REFERENCES UserTypes(type_id)
);

-- Insert default permissions
INSERT IGNORE INTO Permissions VALUES (0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
INSERT IGNORE INTO Permissions VALUES (1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0);
INSERT IGNORE INTO Permissions VALUES (2, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0);

-- Create KnowledgeBaseEdits Table
CREATE TABLE IF NOT EXISTS KnowledgeBaseEdits (
    post_id INT NOT NULL,
    employee_id INT NOT NULL,
    edit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    previous_contents TEXT,
    current_contents TEXT,
    PRIMARY KEY (post_id, employee_id, edit_date),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (post_id) REFERENCES KnowledgeBase(post_id)
);

-- Create ArchivedProjects Table
CREATE TABLE IF NOT EXISTS ArchivedProjects (
    id INT PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Projects(project_id)
);

-- Create ArchivedTasks Table
CREATE TABLE IF NOT EXISTS ArchivedTasks (
    id INT PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Tasks(task_id)
);

-- Create ArchivedKnowledgeBasePages Table
CREATE TABLE IF NOT EXISTS ArchivedKnowledgeBasePages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES KnowledgeBase(post_id)
);

-- Create ArchiveLimits Table
CREATE TABLE IF NOT EXISTS ArchiveLimits (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    taskDuration INT NOT NULL,
    projectDuration INT NOT NULL,
    kbDuration INT NOT NULL
);

-- Create CompletedProjectBacklog Table
CREATE TABLE IF NOT EXISTS CompletedProjectBacklog (
    project_id INT PRIMARY KEY,
    completed_date DATE NOT NULL,
    authorised BOOLEAN NOT NULL DEFAULT FALSE,
    authorised_by INT,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id)
);

-- Create CompletedTasksBacklog Table
CREATE TABLE IF NOT EXISTS CompletedTasksBacklog (
    task_id INT PRIMARY KEY,
    completed_date DATE NOT NULL,
    authorised BOOLEAN NOT NULL DEFAULT FALSE,
    authorised_by INT,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id)
);
