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

def new_project():
    try:
        data = request.json
        project_name = data.get("project_name")
        team_leader_id = data.get("team_leader_id")
        description = data.get("description")
        start_date = data.get("start_date") 
        finish_date = data.get("finish_date")

        if not project_name or not team_leader_id or not description or not start_date or not finish_date:
            return jsonify({"error": "All fields (project name, team leader, description, start date, finish date) are required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if team leader exists
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE user_type_id = 1 AND employee_id = ?", (team_leader_id,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return jsonify({"error": "This employee does not exist or is not a team leader." }), 409
        
        cursor.execute("""
                       INSERT INTO Projects (project_name, team_leader_id, description, start_date, finish_date)
                       VALUES (?,?,?,?,?)
                       """, project_name, team_leader_id, description, start_date, finish_date,)
        
        db.commit()
        return jsonify({"success": True, "message": "Project created successfully"}), 201 
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database Error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

def new_task():
    try:
        data = request.json
        task_name = data.get("task_name")
        project_id = data.get("project_id")
        assigned_employee = data.get("assigned_employee")
        description = data.get("description")
        start_date = data.get("start_date") 
        finish_date = data.get("finish_date")
        prerequesite_tasks = data.get("prerequesite_tasks")

        if not task_name or not assigned_employee or not project_id or not description or not start_date or not finish_date:
            return jsonify({"error": "All fields (task name, assigned employee, proejct id, description, start date, finish date) are required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if employee and project
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_id = ?", (assigned_employee,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return jsonify({"error": "This employee does not exist or cannot be assigned to a task." }), 409
        cursor.execute("SELECT COUNT(*) FROM Projects WHERE project_id = ?", (project_id,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return jsonify({"error": "This project does not exist." }), 409
        cursor.execute("""
                       INSERT INTO Tasks (task_name, assigned_employee, project_id, description, start_date, finish_date)
                       VALUES (?,?,?,?,?)
                       """, task_name, assigned_employee, project_id, description, start_date, finish_date,)
        
        db.commit()

        cursor.execute("""SELECT task_id FROM Tasks WHERE task_name = ? AND assigned_employee = ? 
                       AND project_id = ? AND description = ? AND start_date= ? AND finish_date = ?
                       """, (task_name, assigned_employee, project_id, description, start_date, finish_date,))
        row = cursor.fetchone()
        if row[0] > 0: 
            if prerequesite_tasks:
                prerequesite_tasks.split(",")
                for task in prerequesite_tasks:
                    cursor.execute("""
                                    INSERT INTO PrerequestieTasks (task_id, prerequesite_task_id) VALUES (?,?)
                                """, row[0], task)

    
        db.commit()
        return jsonify({"success": True, "message": "Project created successfully"}), 201 
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database Error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

        

@app.route("/add_user", methods=["POST"])
def add_user():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        second_name = data.get("second_name") or "No Last Name"
        
        if not email or not password or not first_name or not second_name:
            return jsonify({"error": "All fields (email, password, first_name) are required. (second_name) is optional"}), 400
        
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if email exists
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_email = ?", (email,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return jsonify({"error": "There is already an account with this email." }), 409
        
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("""
            INSERT INTO Employees (employee_email, first_name, second_name, hashed_password, user_type_id, current_employee)
            VALUES (?, ?, ?, ?, 2, TRUE)
        """, (email, first_name, second_name, hashed_password))
        db.commit()
        return jsonify({"success": True, "message": "User created successfully"}), 201 
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database Error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Function to verify user login
@app.route("/login", methods=["POST"])
def login():
    try:
        
        data = request.get_json()
        email = data.get("email")
        entered_password = data.get("password")
        
        if not email or not entered_password:
            return jsonify({"error": "Email and password are required"}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT hashed_password FROM Employees WHERE employee_email = ?", (email,))
        row = cursor.fetchone()
        if row and bcrypt.checkpw(entered_password.encode(), row[0].encode()):
            return jsonify({"success": True, "message":"Login successful"})
        else:
            return jsonify({"error": "Email or password is incorrect"}), 401
    except sqlite3.DatabaseError as e:
        return jsonify({"error":"Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error":f"An unexpected error occurred. {str(e)} Please try again later."}), 500

# Function to view completed projects. Returns Project ID, date Completed, whether the project is authorised (to have finished, manager), 
# who authorised the completion of the project, the team leader id and team leader name.
# To be used on manager page to view projects. 
# When project is completed, manager can sign them off, when project completion is authorised, can be moved to archive.
@app.route("/completed_projects", methods=["GET"])
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
        
        if not rows:
            return jsonify({"message": "No completed projects found"}), 404
        
        return jsonify([
            {
                "project_id": row["project_id"],
                "completed_date": row["completed_date"],
                "team_leader_id": row["team_leader"],
                "team_leader_name": row["team_leader_name"]
            } for row in rows
        ]), 200
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    

# Function to move projects to archive
@app.route("/archive_project", methods=["POST"])
def archive_project():
    try:
        data = request.get_json()
        project_id = data.get("project_id")
        archived_date = data.get("archived_date")
        future_autodelete_date = data.get("future_autodelete_date")
        manager_id = data.get("manager_id")
        
        if not all([project_id, archived_date, future_autodelete_date, manager_id]):
            return jsonify({"error": "All fields (project_id, archived_date, future_autodelete_date, manager_id) are required."}), 400

        
        db = get_db()
        cursor = db.cursor()
        
        # Move task to ArchivedTasks
        insert_query = """
        INSERT INTO ArchivedProjects (project_id, archived_date, future_autodelete_date)
        VALUES (?, ?, ?)
        """
        cursor.execute(insert_query, (project_id, archived_date, future_autodelete_date))


        # Update project in Projects
        update_query = "UPDATE Projects SET authorised = 1, authorised_by = ? WHERE project_id = ?"
        cursor.execute(update_query, (manager_id, project_id,))
        
        # Delete project from completedTasksBacklog
        delete_query = "DELETE FROM completedProjectsBacklog WHERE project_id = ?;"
        cursor.execute(delete_query, (project_id,))

        db.commit()
        return jsonify({"success": True, "message": "Project archived successfully."}), 200
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# Function to view tasks when they have been completed, to be used by team leaders to aid 'signing off'
# Displays the task id, the completion date, the employee assigned to task's id
@app.route('/completed_tasks', methods=['GET'])
def view_completed_tasks():
    try:
        data = request.get_json()
        team_leader_id = data.get('team_leader_id')

        if not team_leader_id:
            return jsonify({"error": "Team leader ID is required."}), 400

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

        if not rows:
            return jsonify({"message": "No completed tasks found for this team leader."}), 404

        return jsonify([
            {
                "task_id": row["task_id"],
                "completed_date": row["completed_date"],
                "employee_id": row["employee_id"]
            }
            for row in rows
        ]), 200

    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# Function to add task to archive
@app.route('/archive_task', methods=['POST'])
def archive_task():
    try:
        data = request.get_json()
        task_id = data.get('task_id')
        archived_date = data.get('archived_date')
        future_autodelete_date = data.get('future_autodelete_date')

        if not all([task_id, archived_date, future_autodelete_date]):
            return jsonify({"error": "All fields (task_id, archived_date, future_autodelete_date) are required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Move task to ArchivedTasks
        insert_query = """
        INSERT INTO ArchivedTasks (task_id, archived_date, future_autodelete_date)
        VALUES (?, ?, ?)
        """
        cursor.execute(insert_query, (task_id, archived_date, future_autodelete_date))

        # Delete task from completedTasksBacklog
        delete_query = "DELETE FROM completedTasksBacklog WHERE task_id = ?"
        cursor.execute(delete_query, (task_id,))

        db.commit()
        return jsonify({"success": True, "message": "Task archived successfully."}), 200

    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# Function to find out if project is archived or active
@app.route("/is_project_archived", methods=["GET"])
def is_project_archived(project_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedProjects WHERE id = ?", (project_id,))
        archived = cursor.fetchone()
        return archived is not None
    except sqlite3.DatabaseError as e:
        print(f"Database error: {str(e)}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return False

# Function to find out if task is archived or active
@app.route("/is_task_archived", methods=["GET"])
def is_task_archived():
    try:
        data = request.get_json()
        task_id = data.get("task_id")
        
        if not task_id:
            return jsonify({"error": "Task ID is required"}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedTasks WHERE id = ?", (task_id,))
        
        archived = cursor.fetchone()
        return jsonify({"archived": archived is not None}), 200
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Function to find out if knowledge base page is archived or active
@app.route("/is_post_archived", methods=["GET"])
def is_post_archived():
    try:
        data = request.get_json()
        post_id = data.get("post_id")
        
        if not post_id:
            return jsonify({"error": "Post ID is required"}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedKnowledgeBasePages WHERE id = ?", (post_id,))
        
        archived = cursor.fetchone()
        return jsonify({"archived": archived is not None}), 200
    except sqlite3.DatabaseError as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


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
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        employees = cursor.fetchall()
        ret = [dict(employee) for employee in employees]
        for employee in ret:
            for key in employee:
                employee[key] = str(employee[key])
        return jsonify(ret)
        
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
    employee_id = request.args.get('employee_id')

    query = """
    SELECT p.*
    FROM Projects p
    JOIN EmployeeProjects ep ON p.project_id = ep.project_id
    WHERE 1=1
    """
    params = []

    if project_name:
        query += " AND p.project_name LIKE ?"
        params.append(f"%{project_name}%")
    if team_leader_id:
        query += " AND p.team_leader_id = ?"
        params.append(team_leader_id)
    if completed is not None:
        query += " AND p.completed = ?"
        params.append(completed)
    if start_date:
        query += " AND p.start_date = ?"
        params.append(start_date)
    if finish_date:
        query += " AND p.finish_date = ?"
        params.append(finish_date)
    if authorised_by:
        query += " AND p.authorised_by = ?"
        params.append(authorised_by)
    if employee_id:
        query += " AND ep.employee_id = ?"
        params.append(employee_id)
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        projects = cursor.fetchall()
        print(projects)
        project_list = []
        # Appends boolean for archived status of each project
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
    employee_id = request.args.get('employee_id')

    query = """
    SELECT t.*
    FROM Tasks t
    JOIN EmployeeTasks et ON t.task_id = et.task_id
    WHERE 1=1
    """
    params = []

    if task_name:
        query += " AND t.task_name LIKE ?"
        params.append(f"%{task_name}%")
    if project_id:
        query += " AND t.project_id = ?"
        params.append(project_id)
    if completed is not None:
        query += " AND t.completed = ?"
        params.append(completed)
    if start_date:
        query += " AND t.start_date = ?"
        params.append(start_date)
    if finish_date:
        query += " AND t.finish_date = ?"
        params.append(finish_date)
    if employee_id:
        query += " AND et.employee_id = ?"
        params.append(employee_id)

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        tasks = cursor.fetchall()

        task_list = []
        # Appends boolean for archived status of each task
        for task in tasks:
            task_dict = dict(task)
            task_dict['archived'] = is_task_archived(task['task_id'])
            task_list.append(task_dict)

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
