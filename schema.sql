-- Employees Table
CREATE TABLE IF NOT EXISTS Employees (
    employee_id INTEGER PRIMARY KEY,
    employee_email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    second_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    user_type_id INTEGER NOT NULL,
    current_employee BOOLEAN NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES UserTypes(type_id)
);

-- UserTypes Table
CREATE TABLE IF NOT EXISTS UserTypes (
    type_id INTEGER PRIMARY KEY,
    type_name TEXT NOT NULL UNIQUE
);

-- Insert default user types
INSERT OR IGNORE INTO UserTypes (type_id, type_name) VALUES
    (0, 'Manager'),
    (1, 'ProjectLead'),
    (2, 'Employee');

-- Projects Table
CREATE TABLE IF NOT EXISTS Projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    team_leader_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_date DATETIME,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    authorised_by INTEGER,
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id),
    FOREIGN KEY (team_leader_id) REFERENCES Employees(employee_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS Tasks (
    task_id INTEGER PRIMARY KEY,
    task_name TEXT NOT NULL,
    assigned_employee INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    completed_date DATETIME,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (assigned_employee) REFERENCES Employees(employee_id)
);

-- PrerequisiteTasks Table
CREATE TABLE IF NOT EXISTS PrerequisiteTasks (
    task_id INTEGER NOT NULL,
    prerequisite_task_id INTEGER NOT NULL,
    PRIMARY KEY (task_id, prerequisite_task_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (prerequisite_task_id) REFERENCES Tasks(task_id)
);

-- ToDo Table
CREATE TABLE IF NOT EXISTS ToDo (
    employee_id INTEGER NOT NULL,
    todo_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    future_autodelete_date DATETIME,
    PRIMARY KEY (employee_id, todo_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Tags Table
CREATE TABLE IF NOT EXISTS Tags (
    tag_name TEXT PRIMARY KEY
);

-- ProjectTags Table
CREATE TABLE IF NOT EXISTS ProjectTags (
    project_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    PRIMARY KEY (project_id, tag_name),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (tag_name) REFERENCES Tags(tag_name)
);

-- EmployeeTasks Table
CREATE TABLE IF NOT EXISTS EmployeeTasks (
    task_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    PRIMARY KEY (task_id, employee_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- EmployeeProjects Table
CREATE TABLE IF NOT EXISTS EmployeeProjects (
    project_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- KnowledgeBase Table
CREATE TABLE IF NOT EXISTS KnowledgeBase (
    post_id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    category_id INTEGER,
    deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (category_id) REFERENCES KnowledgeBaseCategories(category_id)
);

-- KnowledgeBaseCategories Table
CREATE TABLE IF NOT EXISTS KnowledgeBaseCategories (
    category_id INTEGER PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS Permissions (
    user_type INTEGER PRIMARY KEY,
    new_project BOOLEAN,
    new_task BOOLEAN,
    edit_project BOOLEAN,
    edit_task BOOLEAN,
    create_knowledgebase_post BOOLEAN,
    edit_knowledgebase_post BOOLEAN,
    delete_knowledgebase_post BOOLEAN,
    change_permissions BOOLEAN,
    view_task_archive BOOLEAN,
    view_project_archive BOOLEAN,
    view_knowledgebase_archive BOOLEAN,
    authorise_completed_tasks BOOLEAN,
    authorise_completed_projects BOOLEAN
    FOREIGN KEY (user_type) REFERENCES UserTypes(type_id)
);

-- Insert default permissions
INSERT OR IGNORE INTO Permissions VALUES (0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
INSERT OR IGNORE INTO Permissions VALUES (1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0);
INSERT OR IGNORE INTO Permissions VALUES (2, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0);

-- KnowledgeBaseEdits Table
CREATE TABLE IF NOT EXISTS KnowledgeBaseEdits (
    post_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    edit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    previous_contents TEXT,
    current_contents TEXT,
    PRIMARY KEY (post_id, employee_id, edit_date),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (post_id) REFERENCES KnowledgeBase(post_id)
);

-- ArchivedProjects Table
CREATE TABLE IF NOT EXISTS ArchivedProjects (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Projects(project_id)
);

-- ArchivedTasks Table
CREATE TABLE IF NOT EXISTS ArchivedTasks (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Tasks(task_id)
);

-- ArchivedKnowledgeBasePages Table
CREATE TABLE IF NOT EXISTS ArchivedKnowledgeBasePages (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES KnowledgeBase(post_id)
);

-- ArchiveLimits Table 
CREATE TABLE IF NOT EXISTS ArchiveLimits (
    id INTEGER PRIMARY KEY NOT NULL,
    taskDuration INTEGER NOT NULL,
    projectDuration INTEGER NOT NULL,
    kbDuration INTEGER NOT NULL
);

-- CompletedProjectBacklog Table (Fixed)
CREATE TABLE IF NOT EXISTS CompletedProjectBacklog (
    project_id INTEGER PRIMARY KEY,
    completed_date DATE NOT NULL,
    authorised BOOLEAN NOT NULL DEFAULT FALSE,
    authorised_by INTEGER,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id)
);

-- CompletedTasksBacklog Table (Fixed)
CREATE TABLE IF NOT EXISTS CompletedTasksBacklog (
    task_id INTEGER PRIMARY KEY,
    completed_date DATE NOT NULL,
    authorised BOOLEAN NOT NULL DEFAULT FALSE,
    authorised_by INTEGER,
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id)
);

