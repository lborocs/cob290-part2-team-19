CREATE TABLE IF NOT EXISTS Employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    second_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    user_type_id INTEGER NOT NULL,
    current_employee BOOL NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES UserTypes(type_id)
);

CREATE TABLE IF NOT EXISTS UserTypes (
    type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    team_leader_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    authorised_by INTEGER,
    FOREIGN KEY (authorised_by) REFERENCES Employees(employee_id),
    FOREIGN KEY (team_leader_id) REFERENCES Employees(employee_id)
);

CREATE TABLE IF NOT EXISTS Tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    finish_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);

CREATE TABLE IF NOT EXISTS Tags (
    tag_name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS ProjectTags (
    project_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    PRIMARY KEY (project_id, tag_name),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (tag_name) REFERENCES Tags(tag_name)
);

CREATE TABLE IF NOT EXISTS EmployeeTasks (
    task_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    PRIMARY KEY (task_id, employee_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

CREATE TABLE IF NOT EXISTS EmployeeProjects (
    project_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

CREATE TABLE IF NOT EXISTS KnowledgeBase (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorised BOOLEAN NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    category_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (category_id) REFERENCES KnowledgeBaseCategories(category_id)
);

CREATE TABLE IF NOT EXISTS KnowledgeBaseCategories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT UNIQUE NOT NULL
);

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

CREATE TABLE IF NOT EXISTS ArchivedProjects (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Projects(project_id)
);

CREATE TABLE IF NOT EXISTS ArchivedTasks (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES Tasks(task_id)
);

CREATE TABLE IF NOT EXISTS ArchivedKnowledgeBasePages (
    id INTEGER PRIMARY KEY,
    archived_date DATE NOT NULL,
    future_autodelete_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES KnowledgeBase(post_id)
);
