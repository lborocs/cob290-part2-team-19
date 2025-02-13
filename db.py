import sqlite3
import bcrypt
from flask import Flask, g
from flask import request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

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

### changing user permissions

#Example request:
#PUT /update_permissions/2
#Content-Type: application/json
#{
#  "new_task": 1,
#  "edit_project": 1
#}
@app.route("/update_permissions/<int:user_type>", methods=["PUT"])
def update_permissions(user_type):
    try:
        data = request.json
        db = get_db()
        cursor = db.cursor()

        update_fields = []
        update_values = []
        for key, value in data.items():
            if key in ["new_project", "new_task", "edit_project", "edit_task", "create_knowledgebase_post", 
                       "edit_knowledgebase_post", "delete_knowledgebase_post", "change_permissions", 
                       "view_task_archive", "view_project_archive", "view_knowledgebase_archive", "authorise_completed"]:
                update_fields.append(f"{key} = ?")
                update_values.append(value)

        if not update_fields:
            return jsonify({"error": "No valid fields provided for update."}), 400

        update_values.append(user_type)
        cursor.execute(f"""
            UPDATE Permissions SET {', '.join(update_fields)} WHERE user_type = ?
        """, update_values)

        if cursor.rowcount == 0:
            return jsonify({"error": "User type not found."}), 404

        db.commit()
        return jsonify({"success": True, "message": "Permissions updated successfully."}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
### Knowledge Base functions
# Add a new post to the knowledge base

# Example request: 
# POST /add_post
# Content-Type: application/json
#{
#  "author_id": 5,
#  "content": "This is a new knowledge base post.",
#  "category_name": "Technical Guides"
#}

@app.route("/add_post", methods=["POST"])
def add_post():
    try:
        data = request.json
        author_id = data.get("author_id")
        content = data.get("content")
        category_id = data.get("category_id")

        if not all([author_id, content, category_id]):
            return jsonify({"error": "Author ID, content, and category id are required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if category exists
        cursor.execute("SELECT category_id FROM KnowledgeBaseCategories WHERE category_id = ?", (category_id,))
        category_id = cursor.fetchone()
        if not category_id:
            return jsonify({"error": "Category does not exist."}), 50

        # Insert post
        cursor.execute("""
            INSERT INTO KnowledgeBase (author_id, content, category_id)
            VALUES (?, ?, ?)
        """, (author_id, content, category_id))

        db.commit()
        return jsonify({"success": True, "message": "Post added successfully"}), 201
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Add Category
@app.route("/add_category", methods=["POST"])
def add_category():
    try:
        data = request.json
        category = data.get("category_name")
        if not category:
            return jsonify({"error": "A category name is required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Insert category
        cursor.execute("""
            INSERT INTO KnowledgeBaseCategories (category_name) VALUES (?)
        """, (category,))

        db.commit()
        return jsonify({"success": True, "message": "Category added successfully"}), 201
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# Delete a post from the knowledge base (mark as deleted and archive it)
# Example request:
#DELETE /delete_post/12

@app.route("/delete_post/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Mark the post as deleted
        cursor.execute("UPDATE KnowledgeBase SET deleted = 1 WHERE post_id = ?", (post_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Post not found."}), 404
        
        # Archive the post
        archived_date = datetime.now().date()
        future_autodelete_date = archived_date + timedelta(days=365)
        cursor.execute("""
            INSERT INTO ArchivedKnowledgeBasePages (id, archived_date, future_autodelete_date)
            VALUES (?, ?, ?)
        """, (post_id, archived_date, future_autodelete_date))
        
        db.commit()
        return jsonify({"success": True, "message": "Post archived successfully"}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Update a post in the knowledge base (log edits instead of modifying directly)

# Example request:
#PUT /update_post/12
#Content-Type: application/json
#{
#  "editor_id": 7,
#  "content": "Updated content for this post.",
#  "category_name": "Software Development"
#}

@app.route("/update_post/<int:post_id>", methods=["PUT"])
def update_post(post_id):
    try:
        data = request.json
        editor_id = data.get("editor_id")
        content = data.get("content")
        category_name = data.get("category_name")

        if not editor_id:
            return jsonify({"error": "Editor ID is required."}), 400

        if content is None and category_name is None:
            return jsonify({"error": "At least one field (content or category) must be provided."}), 400

        db = get_db()
        cursor = db.cursor()

        # Retrieve the old content
        cursor.execute("SELECT content FROM KnowledgeBase WHERE post_id = ?", (post_id,))
        old_post = cursor.fetchone()
        if not old_post:
            return jsonify({"error": "Post not found."}), 404
        old_content = old_post["content"]

        # Check if category exists
        category_id = None
        if category_name:
            cursor.execute("SELECT category_id FROM KnowledgeBaseCategories WHERE category_name = ?", (category_name,))
            category = cursor.fetchone()
            if category:
                category_id = category["category_id"]
            else:
                cursor.execute("INSERT INTO KnowledgeBaseCategories (category_name) VALUES (?)", (category_name,))
                category_id = cursor.lastrowid

        # Log the edit in KnowledgeBaseEdits
        edit_date = datetime.now().date()
        cursor.execute("""
            INSERT INTO KnowledgeBaseEdits (post_id, editor_id, edit_date, old_content, new_content, new_category_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (post_id, editor_id, edit_date, old_content, content, category_id))

        db.commit()
        return jsonify({"success": True, "message": "Edit request submitted for review."}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


### ToDo functions

# New ToDo

# Example request:
# POST /new_todo
#Content-Type: application/json
#{
#  "employee_id": 3,
#  "description": "Prepare a project report"
#}

@app.route("/new_todo", methods=["POST"])
def new_todo():
    try:
        data = request.json
        employee_id = data.get("employee_id")
        description = data.get("description")

        if not employee_id or not description:
            return jsonify({"error": "Both employee_id and description are required."}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("INSERT INTO ToDo (employee_id, description) VALUES (?,?)", (employee_id, description))
        db.commit()

        return jsonify({"success": True, "message": "To-Do created successfully"}), 201 
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Complete ToDo

#Example request:
#POST /complete_todo
#Content-Type: application/json
#{
#  "to_do_id": 8
#}

@app.route("/complete_todo", methods=["POST"])
def complete_todo():
    try:
        data = request.json
        to_do_id = data.get("to_do_id")

        if not to_do_id:
            return jsonify({"error": "No item given"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("UPDATE ToDo SET completed = 1 WHERE to_do_id = ?",(to_do_id))
        db.commit()

        return jsonify({"success": True, "message": "To-Do completed successfully"}), 201 
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Delete ToDo

#Example request:
#POST /delete_todo
#Content-Type: application/json
#{
#  "to_do_id": 8
#}

@app.route("/delete_todo", methods=["POST"])
def delete_todo():
    try:
        data = request.json
        to_do_id = data.get("to_do_id")

        if not to_do_id:
            return jsonify({"error": "No item given"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("UPDATE ToDo SET deleted = 1 WHERE to_do_id = ?",(to_do_id))
        db.commit()

        return jsonify({"success": True, "message": "To-Do deleted successfully"}), 201 
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
    
### PROJECT FUNCTIONS

# New Project

#Example request: 
#POST /new_project
#Content-Type: application/json
#{
#  "project_name": "New Website Development",
#  "team_leader_id": 2,
#  "description": "Developing a new e-commerce website.",
#  "start_date": "2024-03-01",
#  "finish_date": "2024-09-30"
#}

@app.route("/new_project", methods=["POST"])
def new_project():
    try:
        data = request.json
        project_name = data.get("project_name")
        team_leader_id = data.get("team_leader_id")
        description = data.get("description")
        tags = data.get("tags")
        start_date = data.get("start_date")
        finish_date = data.get("finish_date")

        if not all([project_name, team_leader_id, description, start_date, finish_date]):
            return jsonify({"error": "All fields (project name, team leader, description, start date, finish date) are required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if team leader exists
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE user_type_id = 1 AND employee_id = ?", (team_leader_id,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This employee does not exist or is not a team leader."}), 409
        
        cursor.execute("""
            INSERT INTO Projects (project_name, team_leader_id, description, start_date, finish_date)
            VALUES (?,?,?,?,?)
        """, (project_name, team_leader_id, description, start_date, finish_date)) 

        db.commit()
        
        if tags:
            tags_list = tags.split(",")
            for tag in tags_list:
                db = get_db()
                cursor = db.cursor()
                #add tags
                cursor.execute("INSERT INTO ProjectTags (tag_name) VALUES (?)", (tag,))
                #add tags to tag table
                cursor.execute("INSERT OR IGNORE INTO tags VALUES (?)",(tag,))
        
        db.commit()

                
        return jsonify({"success": True, "message": "Project created successfully"}), 201 
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# New Task

#Example request: 
# POST /new_task
#Content-Type: application/json
#{
#  "task_name": "Design Homepage",
#  "project_id": 4,
#  "assigned_employee": 6,
#  "description": "Create a wireframe and design homepage UI.",
#  "start_date": "2024-03-10",
#  "finish_date": "2024-04-15",
#  "prerequesite_tasks": "2,3"
#}

@app.route("/new_task", methods=["POST"])
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

        if not all([task_name, assigned_employee, project_id, description, start_date, finish_date]):
            return jsonify({"error": "All fields (task name, assigned employee, project id, description, start date, finish date) are required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Check if employee exists
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_id = ?", (assigned_employee,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This employee does not exist or cannot be assigned to a task."}), 409

        # Check if project exists
        cursor.execute("SELECT COUNT(*) FROM Projects WHERE project_id = ?", (project_id,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This project does not exist."}), 409

        # Insert task
        cursor.execute("""
            INSERT INTO Tasks (task_name, assigned_employee, project_id, description, start_date, finish_date)
            VALUES (?,?,?,?,?,?)
        """, (task_name, assigned_employee, project_id, description, start_date, finish_date)) 

        # Insert prerequisite tasks if they exist
        if prerequesite_tasks:
            db.commit()

            # Retrieve the task_id
            cursor.execute("""
                SELECT task_id FROM Tasks WHERE task_name = ? AND assigned_employee = ? 
                AND project_id = ? AND description = ? AND start_date= ? AND finish_date = ?
            """, (task_name, assigned_employee, project_id, description, start_date, finish_date))
            row = cursor.fetchone()

            if row and row[0]: 
                task_id = row[0]
                prereq_list = prerequesite_tasks.split(",")  
                for task in prereq_list:
                    cursor.execute("""
                        INSERT INTO PrerequisiteTasks (task_id, prerequesite_task_id) VALUES (?,?)
                    """, (task_id, task)) 

        db.commit()
        return jsonify({"success": True, "message": "Task created successfully"}), 201  
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Fuction for completing task
@app.route("/complete_task", methods=["POST"])
def complete_task():
    try:
        data = request.json
        task_id = data.get("task_id")

        if not task_id:
            return jsonify({"error": "Task ID is required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Mark the task as completed
        completed_date = datetime.now().date()
        cursor.execute("UPDATE Tasks SET completed = 1 AND completed_date = ? WHERE task_id = ?", (task_id, completed_date,))
        cursor.execute("INSERT INTO completedTasksBacklog (task_id, completed_date) VALUES (?, ?)", (task_id, completed_date))

        db.commit()
        return jsonify({"success": True, "message": "Task marked as completed."}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

#Function for completing project
@app.route("/complete_project", methods=["POST"])
def complete_project():
    try:
        data = request.json
        project_id = data.get("project_id")

        if not project_id:
            return jsonify({"error": "Project ID is required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Mark the project as completed
        completed_date = datetime.now().date()
        cursor.execute("UPDATE Projects SET completed = 1 AND completed_date = ? WHERE project_id = ?", (project_id, completed_date,))
        cursor.execute("INSERT INTO completedProjectsBacklog (project_id, completed_date) VALUES (?, ?)", (project_id, completed_date))

        db.commit()
        return jsonify({"success": True, "message": "Project marked as completed."}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
    
#Function for checking project status
@app.route("/project_status/<int:project_id>", methods=["GET"])
def project_status(project_id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT completed, authorised FROM Projects WHERE project_id = ?", (project_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Project not found."}), 404

        if row["completed"] and row["authorised"]:
            status = "Completed"
        elif row["completed"]:
            status = "Under Review"
        else:
            status = "In Progress"

        return jsonify({"project_id": project_id, "status": status}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


#Function for checking task status

@app.route("/task_status/<int:task_id>", methods=["GET"])
def task_status(task_id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT completed, authorised FROM Tasks WHERE task_id = ?", (task_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Task not found."}), 404

        if row["completed"] and row["authorised"]:
            status = "Completed"
        elif row["completed"]:
            status = "Under Review"
        else:
            status = "In Progress"

        return jsonify({"task_id": task_id, "status": status}), 200
    except sqlite3.DatabaseError:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


### USER ACCOUNT FUNCTIONALITY

# Add user

#Example request:
#POST /add_user
#Content-Type: application/json
#{
#  "email": "john.doe@example.com",
#  "password": "securepassword123",
#  "first_name": "John",
#  "second_name": "Doe"
#}

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

#Example request:
#POST /login
#Content-Type: application/json
#{
#  "email": "john.doe@example.com",
#  "password": "securepassword123"
#}

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

### Archive functions

# Function to add task to archive

#Example request:
#POST /archive_task
#Content-Type: application/json
#{
#  "task_id": 10,
#  "archived_date": "2024-02-15",
#  "future_autodelete_date": "2025-02-15"
#}

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
    
# Function to move projects to archive

#Example request:
#POST /archive_project
#Content-Type: application/json
#{
#  "project_id": 5,
#  "archived_date": "2024-02-20",
#  "future_autodelete_date": "2025-02-20",
#  "manager_id": 1
#}

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


# Function to find out if project is archived or active

#Example request:
#GET /is_project_archived
#Content-Type: application/json
#{
#  "project_id": 7
#}

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

#GET /is_task_archived
#Content-Type: application/json
#{
#  "task_id": 12
#}

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

#GET /is_post_archived
#Content-Type: application/json
#{
#  "post_id": 12
#}

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
