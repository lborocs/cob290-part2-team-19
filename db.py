import sqlite3
import bcrypt
from flask import Flask, g
from flask import request, jsonify

DATABASE = 'database.db'
PORT = 3300

# To add commands, change the below function
# To reset DB, delete 'database.db' file
def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()

        # Table for employees
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Employees (
                employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_email TEXT NOT NULL UNIQUE,
                first_name TEXT NOT NULL,
                second_name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                user_type_id INTEGER NOT NULL,
                current_employee BOOL NOT NULL,
                FOREIGN KEY (user_type_id) REFERENCES UserTypes(type_id)
            )
        ''')

        # Table for types of employees
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS UserTypes (
                type_id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_name TEXT NOT NULL UNIQUE
            )
                       
            INSERT INTO UserTypes (type_id, type_name) VALUES (0, Manager)
            INSERT INTO UserTypes (type_id, type_name) VALUES (1, ProjectLead)
            INSERT INTO UserTypes (type_id, type_name) VALUES (2, Employee)
        ''')

        # Table for projects
        cursor.execute('''
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
            )
        ''')

        # Table for tasks
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_name TEXT NOT NULL,
                project_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                start_date DATE NOT NULL,
                finish_date DATE NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                archived BOOLEAN NOT NULL DEFAULT 0,
                FOREIGN KEY (project_id) REFERENCES Projects(project_id)
            )
        ''')

        # Table for tags
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Tags (
                tag_name TEXT PRIMARY KEY
            )
        ''')

        # Table to link projects with tags
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ProjectTags (
                project_id INTEGER NOT NULL,
                tag_name TEXT NOT NULL,
                PRIMARY KEY (project_id, tag_name),
                FOREIGN KEY (project_id) REFERENCES Projects(project_id),
                FOREIGN KEY (tag_name) REFERENCES Tags(tag_name)
            )
        ''')

        # Table to link employees to tasks
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS EmployeeTasks (
                task_id INTEGER NOT NULL,
                employee_id INTEGER NOT NULL,
                PRIMARY KEY (task_id, employee_id),
                FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
            )
        ''')

        # Table to link employees to projects
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS EmployeeProjects (
                project_id INTEGER NOT NULL,
                employee_id INTEGER NOT NULL,
                PRIMARY KEY (project_id, employee_id),
                FOREIGN KEY (project_id) REFERENCES Projects(project_id),
                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
            )
        ''')

        # Table for knowledge base
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS KnowledgeBase (
                post_id INTEGER PRIMARY KEY AUTOINCREMENT,
                author_id INTEGER NOT NULL,
                post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                authorised BOOLEAN NOT NULL DEFAULT 0,
                content TEXT NOT NULL,
                category_id INTEGER,
                FOREIGN KEY (author_id) REFERENCES Employees(employee_id),
                FOREIGN KEY (category_id) REFERENCES KnowledgeBaseCategories(category_id)
            )
        ''')

        # Table for knowledge base categories
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS KnowledgeBaseCategories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name TEXT UNIQUE NOT NULL
            )
        ''')

        # Table for knowledge base edits
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS KnowledgeBaseEdits (
                post_id INTEGER NOT NULL,
                employee_id INTEGER NOT NULL,
                edit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                previous_contents TEXT,
                current_contents TEXT,
                PRIMARY KEY (post_id, employee_id, edit_date),
                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
                FOREIGN KEY (post_id) REFERENCES KnowledgeBase(post_id)
            )
        ''')

        db.commit()

def add_user(email, password, first_name, second_name):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_email = ?", (email,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return "There is already an account with this email." 
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
        cursor.execute("""
            INSERT INTO Employees (employee_email, first_name, second_name, hashed_password, user_type_id, current_employee)
            VALUES (?, ?, ?, ?, 2, TRUE)
        """, (email, first_name, second_name, hashed_password))
        db.commit()
        return True  
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Function to verify user login
def login(email, entered_password):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT hashed_password FROM Employees WHERE employee_email = ?", (email,))
        row = cursor.fetchone()
        if row and bcrypt.checkpw(entered_password.encode(), row[0]):
            return True
        else:
            return "Email or password is incorrect. Please try again."
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

app = Flask(__name__)
@app.route('/create', methods=['POST'])
def create_entry():
    data = request.get_json()
    query = "INSERT INTO entries (name, age) VALUES (?, ?)"
    values = (data['name'], data['age'])
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    return jsonify({'id': cursor.lastrowid}), 201

@app.route('/read/<int:id>', methods=['GET'])
def read_entry(id):
    query = "SELECT * FROM entries WHERE id = ?"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (id,))
    entry = cursor.fetchone()
    if entry is None:
        return jsonify({'error': 'Entry not found'}), 404
    return jsonify({'id': entry[0], 'name': entry[1], 'age': entry[2]})

@app.route('/update/<int:id>', methods=['PUT'])
def update_entry(id):
    data = request.get_json()
    query = "UPDATE entries SET name = ?, age = ? WHERE id = ?"
    values = (data['name'], data['age'], id)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    if cursor.rowcount == 0:
        return jsonify({'error': 'Entry not found'}), 404
    return jsonify({'success': True})

@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_entry(id):
    query = "DELETE FROM entries WHERE id = ?"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (id,))
    db.commit()
    if cursor.rowcount == 0:
        return jsonify({'error': 'Entry not found'}), 404
    return jsonify({'success': True})

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Returns rows as dictionaries
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return "SQLite instance is running!"

def generate_crud_routes(table, key):
    @app.route(f'/{table}', methods=['POST'], endpoint=f'create_{table}')
    def create():
        data = request.get_json()
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, tuple(data.values()))
        db.commit()
        return jsonify({key: cursor.lastrowid}), 201

    @app.route(f'/{table}/<int:id>', methods=['GET'], endpoint=f'read_{table}')
    def read(id):
        query = f"SELECT * FROM {table} WHERE {key} = ?"
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (id,))
        record = cursor.fetchone()
        if record is None:
            return jsonify({'error': f'{table} not found'}), 404
        return jsonify(dict(record))

    @app.route(f'/{table}/<int:id>', methods=['PUT'], endpoint=f'update_{table}')
    def update(id):
        data = request.get_json()
        updates = ', '.join([f"{col} = ?" for col in data.keys()])
        query = f"UPDATE {table} SET {updates} WHERE {key} = ?"
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, tuple(data.values()) + (id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': f'{table} not found'}), 404
        return jsonify({'success': True})

    @app.route(f'/{table}/<int:id>', methods=['DELETE'], endpoint=f'delete_{table}')
    def delete(id):
        query = f"DELETE FROM {table} WHERE {key} = ?"
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': f'{table} not found'}), 404
        return jsonify({'success': True})

generate_crud_routes('Employees','employee_id')
generate_crud_routes('UserTypes', 'type_id')
generate_crud_routes('Projects', 'project_id')
generate_crud_routes('Tasks', 'task_id')
generate_crud_routes('Tags', 'tag_name')
generate_crud_routes('ProjectTags', 'project_id')
generate_crud_routes('EmployeeTasks', 'task_id')
generate_crud_routes('EmployeeProjects', 'project_id')
generate_crud_routes('KnowledgeBase', 'post_id')
generate_crud_routes('KnowledgeBaseCategories', 'category_id')
generate_crud_routes('KnowledgeBaseEdits', 'post_id')


# Search functions for tables
# Search function for Employees
@app.route('/employees/search', methods=['GET'])
def search_employees():
    employee_email = request.args.get('employee_email')
    user_type_id = request.args.get('user_type_id')
    employee_id = request.args.get('employee_id')
    query = "SELECT * FROM Employees WHERE 1=1"
    params = []
    if employee_email:
        query += " AND employee_email LIKE ?"
        params.append(f"%{employee_email}%")
    if user_type_id:
        query += " AND user_type_id = ?"
        params.append(user_type_id)
    if employee_id:
        query += " AND employee_id = ?"
        params.append(user_type_id)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    employees = cursor.fetchall()
    return jsonify([dict(emp) for emp in employees])

# Search function for Projects
@app.route('/projects/search', methods=['GET'])
def search_projects():
    project_name = request.args.get('project_name')
    team_leader_id = request.args.get('team_leader_id')
    start_date = request.args.get('start_date')
    finish_date = request.args.get('finish_date')
    authorised_by = request.args.get('authorised_by')
    completed = request.args.get('completed')
    archived = request.args.get('archived')
    query = "SELECT * FROM Projects WHERE 1=1"
    params = []
    if project_name:
        query += " AND project_name LIKE ?"
        params.append(f"%{project_name}%")
    if team_leader_id:
        query += " AND team_leader_id = ?"
        params.append(team_leader_id)
    if completed is not None:
        query += " AND completed = ?"
        params.append(completed)#
    if start_date:
        query += " AND start_date = ?"
        params.append(start_date)
    if finish_date:
        query += " AND finish_date = ?"
        params.append(finish_date)
    if authorised_by:
        query += " AND authorised_by = ?"
        params.append(authorised_by)
    if archived:
        query += " AND archived = ?"
        params.append(archived)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    projects = cursor.fetchall()
    return jsonify([dict(proj) for proj in projects])

# Search function for Tasks
@app.route('/tasks/search', methods=['GET'])
def search_tasks():
    task_name = request.args.get('task_name')
    project_id = request.args.get('project_id')
    completed = request.args.get('completed')
    start_date = request.args.get('start_date')
    finish_date = request.args.get('finish_date')
    archived = request.args.get('archived')
    query = "SELECT * FROM Tasks WHERE 1=1"
    params = []
    if task_name:
        query += " AND task_name LIKE ?"
        params.append(f"%{task_name}%")
    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    if completed is not None:
        query += " AND completed = ?"
        params.append(completed)
    if start_date:
        query += " AND start_date = ?"
        params.append(start_date)
    if finish_date:
        query += " AND finish_date = ?"
        params.append(finish_date)
    if archived:
        query += " AND archived = ?"
        params.append(archived)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    tasks = cursor.fetchall()
    return jsonify([dict(task) for task in tasks])

# Search function for Knowledge Base
@app.route('/knowledgebase/search', methods=['GET'])
def search_knowledgebase():
    author_id = request.args.get('author_id')
    category_id = request.args.get('category_id')
    query = "SELECT * FROM KnowledgeBase WHERE 1=1"
    params = []
    if author_id:
        query += " AND author_id = ?"
        params.append(author_id)
    if category_id:
        query += " AND category_id = ?"
        params.append(category_id)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    posts = cursor.fetchall()
    return jsonify([dict(post) for post in posts])

# Search function for Employees assigned to Tasks
@app.route('/employees/tasks', methods=['GET'])
def search_employees_tasks():
    task_id = request.args.get('task_id')
    query = "SELECT employee_id FROM EmployeeTasks WHERE task_id = ?"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (task_id,))
    employees = cursor.fetchall()
    return jsonify([row['employee_id'] for row in employees])

# Search function for Employees assigned to Projects
@app.route('/employees/projects', methods=['GET'])
def search_employees_projects():
    project_id = request.args.get('project_id')
    query = "SELECT employee_id FROM EmployeeProjects WHERE project_id = ?"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (project_id,))
    employees = cursor.fetchall()
    return jsonify([row['employee_id'] for row in employees])

# Search function for Projects associated with Tags
@app.route('/projects/tags', methods=['GET'])
def search_projects_tags():
    tag_name = request.args.get('tag_name')
    query = "SELECT project_id FROM ProjectTags WHERE tag_name = ?"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (tag_name,))
    projects = cursor.fetchall()
    return jsonify([row['project_id'] for row in projects])

# Search function for Tasks associated with Tags
@app.route('/tasks/tags', methods=['GET'])
def search_tasks_tags():
    tag_name = request.args.get('tag_name')
    query = "SELECT task_id FROM Tasks WHERE project_id IN (SELECT project_id FROM ProjectTags WHERE tag_name = ?)"
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, (tag_name,))
    tasks = cursor.fetchall()
    return jsonify([row['task_id'] for row in tasks])
    
    
@app.route('/query', methods=['GET'])
def execute_query():
    if app.debug:
        print('Running in debug mode')
    sql_query = request.args.get('sql')
    if not sql_query:
        return jsonify({'error': 'No SQL query provided'}), 400
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(sql_query)
        results = cursor.fetchall()
        return jsonify([dict(row) for row in results])
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 400


        
if __name__ == '__main__':
    app.run(port=PORT)
    init_db()
