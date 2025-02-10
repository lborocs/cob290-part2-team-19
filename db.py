import sqlite3
import bcrypt
from flask import Flask, g
from flask import request, jsonify
from flask_cors import CORS

DATABASE = 'database.db'
PORT = 3300

app = Flask(__name__)
CORS(app)

def get_db():
    try:
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(DATABASE)
            db.row_factory = sqlite3.Row  # Returns rows as dictionaries
        return db
    except sqlite3.DatabaseError as e:
        print(f"Database connection error: {str(e)}")
        return None

def init_db():  
    try:
        with app.app_context():
            db = get_db()
            if db is None:
                return
            cursor = db.cursor()
            with open('schema.sql', 'r') as f:
                schema_sql = f.read()
            cursor.executescript(schema_sql)
            db.commit()
    except sqlite3.DatabaseError as e:
        print(f"Database error during initialization: {str(e)}")

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return "SQLite instance is running!"


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

# Function to view completed projects. Returns Project ID, date Completed, whether the project is authorised (to have finished, manager), 
# who authorised the completion of the project, the team leader id and team leader name.
# To be used on manager page to view projects. 
# When project is completed, manager can sign them off, when project completion is authorised, can be moved to archive.
def view_completed_projects():
    try:
        db = get_db()
        cursor = db.cursor()
        query = """
        SELECT c.project_id, c.completed_date,p.team_leader, e.name AS team_leader_name
        FROM completedProjectBacklog AS c
        JOIN Projects AS p ON c.project_id = p.project_id
        JOIN Employees AS e ON p.team_leader = e.employee_id
        WHERE p.authorised = 0 AND p.completed = 1;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        return jsonify([
            {
                "project_id": row[0],
                "completed_date": row[1],
                "team_leader_id": row[4],
                "team_leader_name": row[5]
            } for row in rows
        ])
    except sqlite3.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
    

# Function to move projects to archive
def archive_project(project_id, archived_date, future_autodelete_date, manager_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Move task to ArchivedTasks
        insert_query = "INSERT INTO ArchivedProjects (?, ?, ?)"
        cursor.execute(insert_query, (project_id, archived_date, future_autodelete_date,))

        # Update project in Projects
        update_query = "UPDATE Projects SET authorised = 1, authorised_by = ? WHERE project_id = ?;"
        cursor.execute(update_query, (manager_id, project_id,))
        
        # Delete project from completedTasksBacklog
        delete_query = "DELETE FROM completedProjectsBacklog WHERE project_id = ?;"
        cursor.execute(delete_query, (project_id,))

        db.commit()
        return jsonify({"success": True, "project_id": project_id})
    except sqlite3.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# Function to view tasks when they have been completed, to be used by team leaders to aid 'signing off'
# Displays the task id, the completion date, the employee assigned to task's id
def view_completed_tasks(team_leader_id):
    try:
        db = get_db()
        cursor = db.cursor()
        query = """
        SELECT c.task_id, c.completed_date, t.employee_id 
        FROM completedTasksBacklog AS c
        JOIN Tasks AS t ON c.task_id = t.task_id
        JOIN Projects AS p ON t.project_id = p.project_id
        WHERE p.team_leader = ?;
        """
        cursor.execute(query, (team_leader_id,))
        rows = cursor.fetchall()
        return jsonify([{"task_id": row[0], "completed_date": row[1]} for row in rows])
    except sqlite3.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# Function to add task to archive
def archive_task(task_id, archived_date, future_autodelete_date):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Move task to ArchivedTasks
        insert_query = """
        INSERT INTO ArchivedTasks (?, ?, ?)
        """
        cursor.execute(insert_query, (task_id, archived_date, future_autodelete_date, ))
        
        # Delete task from completedTasksBacklog
        delete_query = "DELETE FROM completedTasksBacklog WHERE task_id = ?;"
        cursor.execute(delete_query, (task_id,))
        
        db.commit()
        return jsonify({"success": True, "task_id": task_id})
    except sqlite3.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# Function to find out if project is archived or active
def is_project_archived(project_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedProjects WHERE id = ?", (project_id,))
        return cursor.fetchone() is not None
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Function to find out if task is archived or active
def is_task_archived(task_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedTasks WHERE id = ?", (task_id,))
        return cursor.fetchone() is not None
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Function to find out if knowledge base page is archived or active
def is_post_archived(post_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedKnowledgeBasePages WHERE id = ?", (post_id,))
        return cursor.fetchone() is not None
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."


### Search functions for tables

# Search function for Employees
@app.route('/employees/search', methods=['GET'])
def search_employees():
    employee_email = request.args.get('employee_email')
    user_type_id = request.args.get('user_type_id')
    employee_id = request.args.get('employee_id')
    first_name = request.args.get('first_name')
    second_name = request.args.get('second_name')
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
    if first_name:
        query += " AND first_name LIKE ?"
        params.append(f"%{first_name}%")
    if second_name:
        query += " AND second_name LIKE ?"
        params.append(f"%{second_name}%")        
    print(params)
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        employees = cursor.fetchall()
        return jsonify([dict(emp) for emp in employees])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

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
        params.append(completed)
    if start_date:
        query += " AND start_date = ?"
        params.append(start_date)
    if finish_date:
        query += " AND finish_date = ?"
        params.append(finish_date)
    if authorised_by:
        query += " AND authorised_by = ?"
        params.append(authorised_by)

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        projects = cursor.fetchall()
        
        project_list = []
        #Appends boolean for archived status of each project
        for proj in projects:
            proj_dict = dict(proj)
            proj_dict['archived'] = is_project_archived(proj['project_id'])
            project_list.append(proj_dict)

        return jsonify(project_list)
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Tasks
@app.route('/tasks/search', methods=['GET'])
def search_tasks():
    task_name = request.args.get('task_name')
    project_id = request.args.get('project_id')
    completed = request.args.get('completed')
    start_date = request.args.get('start_date')
    finish_date = request.args.get('finish_date')
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
  
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        tasks = cursor.fetchall()

        task_list = []
        #Appends boolean for archived status of each task
        for task in tasks:
            task_dict = dict(task)
            task_dict['archived'] = is_task_archived(task['task_id'])
            task_list.append(task_list)

        return jsonify(task_list)
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Knowledge Base
@app.route('/knowledgebase/search', methods=['GET'])
def search_knowledgebase():
    author_id = request.args.get('author_id')
    category_id = request.args.get('category_id')
    archived = request.args.get('archived')
    query = "SELECT * FROM KnowledgeBase WHERE 1=1"
    params = []
    if author_id:
        query += " AND author_id = ?"
        params.append(author_id)
    if category_id:
        query += " AND category_id = ?"
        params.append(category_id)

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        posts = cursor.fetchall()

        post_list = []
        #Appends boolean for archived status of each post
        for post in posts:
            post_dict = dict(post)
            post_dict['archived'] = is_task_archived(post['post_id'])
            post_dict.append(post_dict)

        return jsonify(post_list)
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Employees assigned to Tasks
@app.route('/employees/tasks', methods=['GET'])
def search_employees_tasks():
    task_id = request.args.get('task_id')
    query = "SELECT employee_id FROM EmployeeTasks WHERE task_id = ?"
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (task_id,))
        employees = cursor.fetchall()
        return jsonify([row['employee_id'] for row in employees])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Employees assigned to Projects
@app.route('/employees/projects', methods=['GET'])
def search_employees_projects():
    project_id = request.args.get('project_id')
    query = "SELECT employee_id FROM EmployeeProjects WHERE project_id = ?"

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (project_id,))
        employees = cursor.fetchall()
        return jsonify([row['employee_id'] for row in employees])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Projects associated with Tags
@app.route('/projects/tags', methods=['GET'])
def search_projects_tags():
    tag_name = request.args.get('tag_name')
    query = "SELECT project_id FROM ProjectTags WHERE tag_name = ?"
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (tag_name,))
        projects = cursor.fetchall()
        return jsonify([row['project_id'] for row in projects])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for Tasks associated with Tags
@app.route('/tasks/tags', methods=['GET'])
def search_tasks_tags():
    tag_name = request.args.get('tag_name')
    query = "SELECT task_id FROM Tasks WHERE project_id IN (SELECT project_id FROM ProjectTags WHERE tag_name = ?)"
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (tag_name,))
        tasks = cursor.fetchall()
        return jsonify([row['task_id'] for row in tasks])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."
    
# Search function for Tasks that employees are assigned to for a given project
@app.route('/projects/<int:project_id>/tasks/employees', methods=['GET'])
def get_tasks_employees_for_project(project_id):
    query = """
    SELECT t.task_id, t.task_name, et.employee_id
    FROM Tasks t
    JOIN EmployeeTasks et ON t.task_id = et.task_id
    WHERE t.project_id = ?
    """
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (project_id,))
        tasks_employees = cursor.fetchall()
        return jsonify([dict(task_employee) for task_employee in tasks_employees])
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Search function for User Type and Employee data by Employee ID
@app.route('/employees/<int:employee_id>/details', methods=['GET'])
def get_employee_details(employee_id):
    query = """
    SELECT e.employee_id, e.employee_email, e.first_name, e.second_name, e.user_type_id, ut.type_name
    FROM Employees e
    JOIN UserTypes ut ON e.user_type_id = ut.type_id
    WHERE e.employee_id = ?
    """
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, (employee_id,))
        employee_details = cursor.fetchone()
        if employee_details is None:
            return jsonify({'error': 'Employee not found'}), 404
        return jsonify(dict(employee_details))
    except sqlite3.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

# Function for executing SQL queries
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
