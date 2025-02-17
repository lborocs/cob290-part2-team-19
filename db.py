import mysql.connector
import json
import bcrypt
import schedule
import time
from flask import Flask, g
from flask import request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

# Update these settings with your MySQL configuration
DATABASE_HOST = '35.240.24.117'  
DATABASE_USER = 'admin'     # Your MySQL username
DATABASE_PASSWORD = 'password123' # Your MySQL password
DATABASE_NAME = 'productivityManagement'      # Your MySQL database name
PORT = 3300

app = Flask(__name__)
CORS(app)

# Function to convert rows into dictionaries
def dict_cursor(cursor, query):
    cursor.execute(query)
    columns = [col[0] for col in cursor.description]  # Get column names
    results = cursor.fetchall()  # Fetch all results
    return [dict(zip(columns, row)) for row in results]  # Convert to dict



""""" DB Initialisation Functionality """

def get_db():
    try:
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = mysql.connector.connect(
                host=DATABASE_HOST,
                user=DATABASE_USER,
                password=DATABASE_PASSWORD,
                database=DATABASE_NAME
            )
        return db
    except mysql.connector.Error as e:
        print(f"Database connection error: {str(e)}")
        return None
    
def commit_changes(db):
    db.commit()
    db.close()
    

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return "SQL instance is running!"

@app.route('/query', methods=['GET'])
def execute_query():
    sql_query = request.args.get('sql')
    if not sql_query:
        return jsonify({'error': 'No SQL query provided'}), 400
    try:
        db = get_db()
        cursor = db.cursor()
        # Use the dict_cursor function to get results as dictionaries
        results = dict_cursor(cursor, sql_query)
        return jsonify(results)
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 400



""" Auto-delete Functions """

def autodelete_projects():
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Archive projects, employee projects
        current_date = datetime.now().strftime('%Y-%m-%d')
        query = "SELECT project_id FROM ArchivedProjects WHERE future_autodelete_date < %s"
        expired_projects = dict_cursor(cursor, query, (current_date,))
        
        for project in expired_projects:
            project_id = project['project_id']
            cursor.execute("DELETE FROM Projects WHERE project_id = %s", (project_id,))
            cursor.execute("DELETE FROM ArchivedProjects WHERE project_id = %s", (project_id,))
            cursor.execute("DELETE FROM EmployeeProjects WHERE project_id = %s", (project_id,))
        
        commit_changes(db)
        print(f"Deleted {len(expired_projects)} expired projects.")
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

def autodelete_tasks():
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Archive tasks, employee tasks, prerequisite tasks
        current_date = datetime.now().strftime('%Y-%m-%d')
        query = "SELECT task_id FROM ArchivedTasks WHERE future_autodelete_date < %s"
        expired_tasks = dict_cursor(cursor, query, (current_date,))
        
        for task in expired_tasks:
            task_id = task['task_id']
            cursor.execute("DELETE FROM Tasks WHERE task_id = %s", (task_id,))
            cursor.execute("DELETE FROM ArchivedTasks WHERE task_id = %s", (task_id,))
            cursor.execute("DELETE FROM EmployeeTasks WHERE task_id = %s", (task_id,))
            cursor.execute("DELETE FROM PrerequisiteTasks WHERE task_id = %s OR prerequisite = %s", (task_id, task_id,))
        
        commit_changes(db)
        print(f"Deleted {len(expired_tasks)} expired tasks.")
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

def autodelete_knowledgebase():
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Archive knowledge base posts, knowledge base edits
        current_date = datetime.now().strftime('%Y-%m-%d')
        query = "SELECT id FROM ArchivedKnowledgeBasePages WHERE future_autodelete_date < %s"
        expired_posts = dict_cursor(cursor, query, (current_date,))
        
        for post in expired_posts:
            post_id = post['id']
            cursor.execute("DELETE FROM ArchivedKnowledgeBasePages WHERE id = %s", (post_id,))
            cursor.execute("DELETE FROM KnowledgeBase WHERE post_id = %s", (post_id,))
            cursor.execute("DELETE FROM KnowledgeBaseEdits WHERE post_id = %s", (post_id,))
        
        commit_changes(db)
        print(f"Deleted {len(expired_posts)} expired knowledge base posts.")
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

# Scheduling
schedule.every().day.at("00:00").do(autodelete_projects)
schedule.every().day.at("00:00").do(autodelete_tasks)
schedule.every().day.at("00:00").do(autodelete_knowledgebase)


@app.route("/get_user_types", methods=["GET"])
def get_user_types():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT * FROM UserTypes"
        user_types = dict_cursor(cursor, query)
        return jsonify(user_types)  # Return the list of dictionaries
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

@app.route("/get_users", methods=["GET"])
def get_users():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT employee_id, first_name, second_name FROM Employees"
        users = dict_cursor(cursor, query)

        # Formatting the users list
        users_list = [
            {"id": user["employee_id"], "name": f"{user['first_name']} {user['second_name']}"} for user in users
        ]
        
        return jsonify(users_list)  # Return the list of users as JSON
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

@app.route("/get_permissions_by_user_type/<int:user_type>", methods=["GET"])
def get_user_permissions_by_type(user_type):
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT * FROM Permissions WHERE user_type = %s"
        permissions = dict_cursor(cursor, query, (user_type,))

        if not permissions:
            return jsonify({"error": "User type not found"}), 404

        # Convert row to dictionary & ensure values are boolean (0 → False, 1 → True)
        permissions_dict = {key: bool(value) for key, value in permissions[0].items()}

        return jsonify(permissions_dict)
    
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

@app.route("/update_permissions/<int:user_type>", methods=["PUT"])
def update_permissions(user_type):
    try:
        data = request.get_json()  # Correct method to access JSON data
        db = get_db()
        cursor = db.cursor()

        update_fields = []
        update_values = []
        for key, value in data.items():
            # List of valid permission fields
            valid_fields = [
                "new_project", "new_task", "edit_project", "edit_task", 
                "create_knowledgebase_post", "edit_knowledgebase_post", 
                "delete_knowledgebase_post", "access_admin", 
                "view_task_archive", "view_project_archive", 
                "view_knowledgebase_archive", "authorise_completed_tasks", 
                "authorise_completed_projects"
            ]
            
            # If the key is valid, append it for updating
            if key in valid_fields:
                update_fields.append(f"{key} = %s")
                update_values.append(value)

        if not update_fields:
            return jsonify({"error": "No valid fields provided for update."}), 400

        # Append user_type to update_values
        update_values.append(user_type)
        
        # Update query with placeholders for the dynamic fields
        query = f"""
            UPDATE Permissions SET {', '.join(update_fields)} WHERE user_type = %s
        """
        update_values.append(user_type)
        cursor.execute(query, update_values)

        # Check if any rows were updated
        if cursor.rowcount == 0:
            return jsonify({"error": "User type not found."}), 404

        # Commit the changes to the database
        db.commit()

        return jsonify({"success": True, "message": "Permissions updated successfully."}), 200

    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500



# Add a new post to the knowledge base
@app.route("/add_post", methods=["POST"])
def add_post():
    print("🔹 Received /add_post request") 
    try:
        data = request.json()
        print("🔵 Incoming Request Data:", data)  

        author_id = data.get("author_id")
        content = data.get("content")
        category_id = data.get("category_id")

        print("🔵 Checking Category ID:", category_id)

        if not all([author_id, content, category_id]):
            print("❌ ERROR: Missing required fields!")
            return jsonify({"error": "Author ID, content, and category_id are required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if category exists
        cursor.execute("SELECT category_id FROM KnowledgeBaseCategories WHERE category_id = %s", (category_id,))
        category = cursor.fetchone()
        print("🔵 Category Lookup Result:", category)

        if not category:
            print(f"❌ ERROR: Category ID {category_id} does not exist!")
            return jsonify({"error": "Category does not exist."}), 400

        # Insert post
        print(f"🔹 Inserting Post: Author ID = {author_id}, Content = {content}, Category ID = {category_id}")
        cursor.execute("""
            INSERT INTO KnowledgeBase (author_id, content, category_id)
            VALUES (%s, %s, %s)
        """, (author_id, content, category_id))

        db.commit()
        print("✅ Post added successfully!")
        return jsonify({"success": True, "message": "Post added successfully"}), 201

    except mysql.connector.Error as e:
        print(f"❌ Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# Get posts
@app.route('/guides/<int:category_id>', methods=['GET'])
def get_posts_by_category(category_id):
    try:
        db = get_db()
        cursor = db.cursor()

        query = """
            SELECT 
                kb.post_id AS id, 
                kb.content AS content, 
                kb.author_id AS author_id, 
                kc.category_name AS category, 
                e.first_name || ' ' || e.second_name AS author_name
            FROM KnowledgeBase kb
            LEFT JOIN KnowledgeBaseCategories kc ON kb.category_id = kc.category_id
            LEFT JOIN Employees e ON kb.author_id = e.employee_id
            WHERE kb.category_id = %s AND kb.deleted = 0
        """

        posts = dict_cursor(cursor, query, (category_id,))

        formatted_posts = [
            {
                "id": post["id"],
                "title": post["content"][:30] + "...",  # ✅ Extracting first 30 chars as title
                "category": post["category"],
                "author": post["author_name"] or "Unknown",
                "content": post["content"],
            }
            for post in posts
        ]

        return jsonify(formatted_posts), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# Add Category to knowledge base
@app.route("/add_category", methods=["POST"])
def add_category():
    try:
        data = request.json()
        category = data.get("category_name")
        if not category:
            return jsonify({"error": "A category name is required."}), 400

        db = get_db()
        cursor = db.cursor()
        
        # Check if category already exists
        cursor.execute("SELECT category_id FROM KnowledgeBaseCategories WHERE category_name = %s", (category,))
        existing_category = cursor.fetchone()
        if existing_category:
            return jsonify({"error": "Category already exists."}), 409  # 409 Conflict if it exists

        # Insert new category
        cursor.execute("INSERT INTO KnowledgeBaseCategories (category_name) VALUES (%s)", (category,))
        category_id = cursor.lastrowid  # Get the newly inserted category ID

        commit_changes(db)

        # Return the created category
        return jsonify({
            "success": True,
            "message": "Category added successfully",
            "category": {
                "name": category,  
                "guides": [],  
                "author": "Unknown",
                "color": "bg-gradient-to-r from-yellow-400 to-yellow-600"
            }
        }), 201

    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Get knowledge base categories
@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        db = get_db()
        cursor = db.cursor()
        
        query = """
            SELECT c.category_id, c.category_name, COUNT(kb.post_id) as guide_count
            FROM KnowledgeBaseCategories c
            LEFT JOIN KnowledgeBase kb ON c.category_id = kb.category_id
            GROUP BY c.category_id
        """
        
        categories = dict_cursor(cursor, query)

        formatted_categories = [
            {
                "category_id": cat["category_id"],  # ✅ Add category_id for guide fetching
                "name": cat["category_name"],
                "guides_count": cat["guide_count"],  
                "author": "Unknown",
                "color": "bg-gradient-to-r from-yellow-400 to-yellow-600"
            }
            for cat in categories
        ]

        return jsonify(formatted_categories), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# Delete a post from the knowledge base (mark as deleted and archive it)
@app.route("/delete_post/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Mark the post as deleted
        cursor.execute("UPDATE KnowledgeBase SET deleted = 1 WHERE post_id = %s", (post_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Post not found."}), 404
        
        # Archive the post
        archived_date = datetime.now().date()
        future_autodelete_date = archived_date + timedelta(days=365)
        cursor.execute("""
            INSERT INTO ArchivedKnowledgeBasePages (id, archived_date, future_autodelete_date)
            VALUES (%s, %s, %s)
        """, (post_id, archived_date, future_autodelete_date))
        
        commit_changes(db)
        return jsonify({"success": True, "message": "Post archived successfully"}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Update a post in the knowledge base (log edits instead of modifying directly)
@app.route("/update_post/<int:post_id>", methods=["PUT"])
def update_post(post_id):
    try:
        data = request.json()
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
        cursor.execute("SELECT content FROM KnowledgeBase WHERE post_id = %s", (post_id,))
        old_post = cursor.fetchone()
        if not old_post:
            return jsonify({"error": "Post not found."}), 404
        old_content = old_post["content"]

        # Check if category exists
        category_id = None
        if category_name:
            cursor.execute("SELECT category_id FROM KnowledgeBaseCategories WHERE category_name = %s", (category_name,))
            category = cursor.fetchone()
            if category:
                category_id = category["category_id"]
            else:
                cursor.execute("INSERT INTO KnowledgeBaseCategories (category_name) VALUES (%s)", (category_name,))
                category_id = cursor.lastrowid

        # Log the edit in KnowledgeBaseEdits
        edit_date = datetime.now().date()
        cursor.execute("""
            INSERT INTO KnowledgeBaseEdits (post_id, editor_id, edit_date, old_content, new_content, new_category_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (post_id, editor_id, edit_date, old_content, content, category_id))

        commit_changes(db)
        return jsonify({"success": True, "message": "Edit request submitted for review."}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


# New ToDo
@app.route("/new_todo", methods=["POST"])
def new_todo():
    try:
        data = request.get_json()
        print(data)
        # Validate request data
        employee_id = data.get("employee_id")
        description = data.get("description")
        task_id = data.get("task_id")
        if employee_id is None or not description:
            return jsonify({"error": "Missing employee_id or description"}), 400

        db = get_db()
        cursor = db.cursor()
        query = """
        INSERT INTO ToDo (employee_id, todo_id, description, completed, deleted)
        VALUES (%s, %s, %s, 0, 0)
        """
        cursor.execute(query, (employee_id, task_id, description))
        commit_changes(db)

        return jsonify({"success": True, "todo_id": cursor.lastrowid}), 201

    except mysql.connector.Error as e:
        db.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# Delete ToDo
@app.route("/delete_todo", methods=["DELETE"])
def delete_todo():
    try:
        employee_id = request.args.get("employee_id")
        print("employee_id", employee_id)  
        if employee_id is None:
            return jsonify({"error": "No item given"}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM ToDo WHERE deleted = 1 AND employee_id = %s", (employee_id,))
        commit_changes(db)

        return jsonify({"success": True, "message": "To-Do deleted successfully"}), 201 
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Update ToDo
@app.route("/update_todo_status", methods=["PUT"])
def update_todo():
    try:
        data = request.json()
        to_do_id = data.get("to_do_id")
        employee_id = data.get("employee_id")
        completed = data.get("completed")
        deleted = data.get("deleted")
        if to_do_id is None or employee_id is None or (completed is None and deleted is None):
            return jsonify({"error": "No item given"}), 400

        db = get_db()
        cursor = db.cursor()
        params = []
        query = "UPDATE ToDo SET "
        if completed is not None:
            query += "completed = %s"
            params.append(completed)
        if deleted is not None:
            query += "deleted = %s"
            params.append(deleted)
        query += " WHERE todo_id = %s AND employee_id = %s"
        params.append(to_do_id)
        params.append(employee_id)
        cursor.execute(query, params)
        commit_changes(db)
        
        return jsonify({"success": True, "message": "To-Do updated successfully"}), 201 
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500    

# Get ToDos
@app.route("/get_todos", methods=["GET"])
def get_to_dos():
    try:
        employee_id = request.args.get("employee_id")
        completed = request.args.get("completed")
        deleted = request.args.get("deleted")
        
        if employee_id is None:
            return jsonify({"error": "Employee ID is required."}), 400
        
        db = get_db()
        cursor = db.cursor()
        params = [employee_id]
        query = """
        SELECT todo_id, description, completed, deleted
        FROM ToDo
        WHERE employee_id = %s
        """
        if completed is not None:
            query += " AND completed = %s"
            params.append(completed)
        if deleted is not None:
            query += " AND deleted = %s"
            params.append(deleted)
        cursor.execute(query, params)
        to_dos = dict_cursor(cursor, query, params)
        return jsonify(to_dos)
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

    
# New Project
@app.route("/new_project", methods=["POST"])
def new_project():
    try:
        data = request.json()
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
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE user_type_id = 1 AND employee_id = %s", (team_leader_id,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This employee does not exist or is not a team leader."}), 409
        
        cursor.execute("""
            INSERT INTO Projects (project_name, team_leader_id, description, start_date, finish_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (project_name, team_leader_id, description, start_date, finish_date)) 

        commit_changes(db)
        
        if tags:
            tags_list = tags.split(",")
            for tag in tags_list:
                cursor.execute("INSERT INTO ProjectTags (tag_name) VALUES (%s)", (tag,))
                cursor.execute("INSERT OR IGNORE INTO tags VALUES (%s)", (tag,))
        commit_changes(db)

        return jsonify({"success": True, "message": "Project created successfully"}), 201 
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# New Task
@app.route("/new_task", methods=["POST"])
def new_task():
    try:
        data = request.json()
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
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_id = %s", (assigned_employee,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This employee does not exist or cannot be assigned to a task."}), 409

        # Check if project exists
        cursor.execute("SELECT COUNT(*) FROM Projects WHERE project_id = %s", (project_id,))
        row = cursor.fetchone()
        if row[0] == 0: 
            return jsonify({"error": "This project does not exist."}), 409

        # Insert task
        cursor.execute("""
            INSERT INTO Tasks (task_name, assigned_employee, project_id, description, start_date, finish_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (task_name, assigned_employee, project_id, description, start_date, finish_date)) 

        # Insert prerequisite tasks if they exist
        if prerequesite_tasks:
            commit_changes(db)

            # Retrieve the task_id
            cursor.execute("""
                SELECT task_id FROM Tasks WHERE task_name = %s AND assigned_employee = %s 
                AND project_id = %s AND description = %s AND start_date= %s AND finish_date = %s
            """, (task_name, assigned_employee, project_id, description, start_date, finish_date))
            row = cursor.fetchone()

            if row and row[0]: 
                task_id = row[0]
                prereq_list = prerequesite_tasks.split(",")  
                for task in prereq_list:
                    cursor.execute("""
                        INSERT INTO PrerequisiteTasks (task_id, prerequesite_task_id) VALUES (%s, %s)
                    """, (task_id, task)) 

        commit_changes(db)
        return jsonify({"success": True, "message": "Task created successfully"}), 201  
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Function for completing task
@app.route("/complete_task", methods=["POST"])
def complete_task():
    try:
        task_id = request.args.get("task_id")
        if not task_id:
            return jsonify({"error": "Task ID is required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Mark the task as completed
        completed_date = datetime.now().date()
        cursor.execute("UPDATE Tasks SET completed = 1, completed_date = %s WHERE task_id = %s", (completed_date, task_id))
    
        commit_changes(db)
        
        return jsonify({"success": True, "message": "Task marked as completed."}), 200
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
# Function for completing project
@app.route("/complete_project", methods=["POST"])
def complete_project():
    try:
        data = request.json()
        project_id = data.get("project_id")

        if not project_id:
            return jsonify({"error": "Project ID is required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Mark the project as completed
        completed_date = datetime.now().date()
        cursor.execute("UPDATE Projects SET completed = 1, completed_date = %s WHERE project_id = %s", (completed_date, project_id))
        cursor.execute("INSERT INTO completedProjectsBacklog (project_id, completed_date) VALUES (%s, %s)", (project_id, completed_date))

        commit_changes(db)
        return jsonify({"success": True, "message": "Project marked as completed."}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
# Function for checking project status
@app.route("/project_status/<int:project_id>", methods=["GET"])
def project_status(project_id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT completed, authorised FROM Projects WHERE project_id = %s", (project_id,))
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
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Function for checking task status
@app.route("/task_status/<int:task_id>", methods=["GET"])
def task_status(task_id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT completed, authorised FROM Tasks WHERE task_id = %s", (task_id,))
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
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Add user
@app.route("/add_user", methods=["POST"])
def add_user():
    try:
        data = request.json()
        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        second_name = data.get("second_name") or "No Last Name"
        
        if not email or not password or not first_name or not second_name:
            return jsonify({"error": "All fields (email, password, first_name) are required. (second_name) is optional"}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if email exists
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE employee_email = %s", (email,))
        row = cursor.fetchone()
        if row[0] > 0:  
            return jsonify({"error": "There is already an account with this email." }), 409
        
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("""
            INSERT INTO Employees (employee_email, first_name, second_name, hashed_password, user_type_id, current_employee)
            VALUES (%s, %s, %s, %s, 2, TRUE)
        """, (email, first_name, second_name, hashed_password))
        commit_changes(db)
        return jsonify({"success": True, "message": "User created successfully"}), 201 
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

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
        # Fetch user data from the database based on the provided email
        cursor.execute("SELECT employee_id, first_name, second_name, employee_email, user_type_id, hashed_password FROM Employees WHERE employee_email = %s", (email,))
        row = cursor.fetchone()

        if row:
            # Check if entered password matches stored hash
            if bcrypt.checkpw(entered_password.encode(), row[5].encode()):  # Access hashed_password at index 5
                user = { 
                    "id": row[0],
                    "name": row[1] + " " + row[2],  # Concatenate first name and second name
                    "email": row[3],
                    "user_type_id": row[4],
                }
                return jsonify({"success": True, "message": "Login successful", "user": user})
            else:
                return jsonify({"error": "Email or password is incorrect"}), 401
        else:
            return jsonify({"error": "User not found"}), 404
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# Change User Type
@app.route("/change_user_type", methods=["PUT"])
def change_user_type():
    try:
        data = request.get_json()
        new_user_type = data.get("new_user_type")
        employee_id = data.get("employee_id")
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            UPDATE Employees 
            SET user_type_id = %s 
            WHERE employee_id = %s
        ''', (new_user_type, employee_id))
        commit_changes(db)
        return jsonify({"success": True, "message": "User Type changed!"})
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

    
# Get archive durations
@app.route("/get_archive_limits", methods=["GET"])
def get_archive_limits():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT taskDuration, projectDuration, kbDuration FROM ArchiveLimits WHERE id = 1"
        duration = dict_cursor(cursor, query)
        return jsonify({
            "task": duration[0]["taskDuration"],
            "project": duration[0]["projectDuration"],
            "kb": duration[0]["kbDuration"]
        })
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500   

# Update Archive Durations
@app.route("/update_archive_durations", methods=["PUT"])
def update_archive_durations():
    try:
        data = request.json()
        task = data.get("task")
        project = data.get("project")
        kb = data.get("kb")
         # Validate that task, project, and kb are all numbers
        if not isinstance(task, (int, float)) or not isinstance(project, (int, float)) or not isinstance(kb, (int, float)):
            return jsonify({"error": f"Invalid task duration: {task}, project duration: {project}, knowledge base duration: {kb}"}), 400
        db = get_db()
        cursor = db.cursor()
        query = '''
            UPDATE ArchiveLimits SET taskDuration = %s, projectDuration = %s, kbDuration = %s WHERE id = 1
        '''
        cursor.execute(query, (task, project, kb))
        commit_changes(db)
        return jsonify({"success": True, "message": "Durations updated successfully."}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Get time tasks are kept in archive
@app.route("/get_task_archive_duration", methods=["GET"])
def get_task_archive_duration():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT taskDuration FROM ArchiveLimits WHERE id = 1"
        duration = dict_cursor(cursor, query)
        return str(duration[0]["taskDuration"])
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500     

# Get time projects are kept in archive
@app.route("/get_project_archive_duration", methods=["GET"])
def get_project_archive_duration():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT projectDuration FROM ArchiveLimits WHERE id = 1"
        duration = dict_cursor(cursor, query)
        return str(duration[0]["projectDuration"])
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500        

# Get time kb posts are kept in archive
@app.route("/get_kb_archive_duration", methods=["GET"])
def get_kb_archive_duration():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT kbDuration FROM ArchiveLimits WHERE id = 1"
        duration = dict_cursor(cursor, query)
        return str(duration[0]["kbDuration"])
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500        

# Function to add task to archive
@app.route('/archive_task', methods=['POST'])
def archive_task():
    try:
        data = request.get_json()
        task_id = data.get('task_id')
        archived_date = datetime.now()
        delete_date = (datetime.now() + timedelta(days=get_task_archive_duration())).strftime('%Y-%m-%d')

        if not all([task_id, archived_date]):
            return jsonify({"error": "All fields (task_id, archived_date) are required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Move task to ArchivedTasks
        insert_query = """
        INSERT INTO ArchivedTasks (task_id, archived_date, future_autodelete_date)
        VALUES (%s, %s, %s)
        """
        cursor.execute(insert_query, (task_id, archived_date, delete_date))

        # Delete task from completedTasksBacklog
        delete_query = "DELETE FROM completedTasksBacklog WHERE task_id = %s"
        cursor.execute(delete_query, (task_id,))

        commit_changes(db)
        return jsonify({"success": True, "message": "Task archived successfully."}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    
# Function to add projects to archive
@app.route("/archive_project", methods=["POST"])
def archive_project():
    try:
        data = request.get_json()
        project_id = data.get("project_id")
        archived_date = datetime.now()
        manager_id = data.get("manager_id")
        delete_date = (datetime.now() + timedelta(days=get_project_archive_duration())).strftime('%Y-%m-%d')

        if not all([project_id, archived_date, manager_id]):
            return jsonify({"error": "All fields (project_id, archived_date, manager_id) are required."}), 400

        db = get_db()
        cursor = db.cursor()

        # Move project to ArchivedProjects
        insert_query = """
        INSERT INTO ArchivedProjects (project_id, archived_date, future_autodelete_date)
        VALUES (%s, %s, %s)
        """
        cursor.execute(insert_query, (project_id, archived_date, delete_date))

        # Update project in Projects
        update_query = "UPDATE Projects SET authorised = 1, authorised_by = %s WHERE project_id = %s"
        cursor.execute(update_query, (manager_id, project_id))

        # Delete project from completedProjectsBacklog
        delete_query = "DELETE FROM completedProjectsBacklog WHERE project_id = %s"
        cursor.execute(delete_query, (project_id,))

        commit_changes(db)
        return jsonify({"success": True, "message": "Project archived successfully."}), 200
    except mysql.connector.Error as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

# Function to add knowledge base posts to archive
@app.route('/archive_kb_post', methods=['POST'])
def archive_kb_post():
    try:
        # Fetch the data from the request
        data = request.get_json()
        post_id = data.get('post_id')  # Post ID
        archived_date = datetime.now()  # Date the post is archived

        # Get the archive duration (for knowledge base posts)
        delete_date = (datetime.now() + timedelta(days=get_kb_archive_duration())).strftime('%Y-%m-%d')

        # Ensure both post_id and archived_date are provided
        if not all([post_id, archived_date]):
            return jsonify({"error": "All fields (post_id, archived_date) are required."}), 400

        # Connect to the database
        db = get_db()
        cursor = db.cursor()

        # Move post to ArchivedKnowledgeBasePosts
        cursor.execute("""
        INSERT INTO ArchivedKnowledgeBasePages (id, archived_date, future_autodelete_date)
        VALUES (%s, %s, %s)
        """, (post_id, archived_date, delete_date))

        # Commit the changes to the database
        commit_changes(db)

        return jsonify({"success": True, "message": "Knowledge base post archived successfully."}), 200
    except mysql.connector.Error:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# Function to find out if project is archived or active
@app.route("/is_project_archived", methods=["GET"])
def is_project_archived(project_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedProjects WHERE id = %s", (project_id,))
        archived = cursor.fetchone()
        return jsonify({"archived": archived is not None}), 200
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

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
        cursor.execute("SELECT 1 FROM ArchivedTasks WHERE id = %s", (task_id,))
        archived = cursor.fetchone()
        return jsonify({"archived": archived is not None}), 200
    except mysql.connector.Error as e:
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
        cursor.execute("SELECT 1 FROM ArchivedKnowledgeBasePages WHERE id = %s", (post_id,))
        archived = cursor.fetchone()
        return jsonify({"archived": archived is not None}), 200
    except mysql.connector.Error as e:
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

@app.route("/archived_projects", methods=["GET"])
def get_archived_projects():
    try:
        db = get_db()
        cursor = db.cursor()

        # Execute the query to fetch archived projects
        query = """
            SELECT p.project_id, p.project_name, p.team_leader_id, 
                   e.first_name || ' ' || e.second_name AS team_leader_name, 
                   ap.archived_date, p.completed
            FROM Projects p
            JOIN ArchivedProjects ap ON p.project_id = ap.id
            JOIN Employees e ON p.team_leader_id = e.employee_id
        """

        # Use dict_cursor to fetch results as dictionaries
        archived_projects = dict_cursor(cursor,query)

        return jsonify(archived_projects), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500


# For other functions, use so we can pass param
def is_task_archived_local(task_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1 FROM ArchivedTasks WHERE id = %s", (task_id,))
        archived = cursor.fetchone()
        return archived is not None
    except mysql.connector.Error as e:
        print(f"Database error: {str(e)}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return False

# Function to delete project
@app.route("/delete_project", methods=["DELETE"])
def delete_project():
    try:
        project_id = request.args.get("project_id")
        if not project_id:
            return jsonify({"error": "Project ID is required."}), 400
        
        db = get_db()
        cursor = db.cursor()

        # Delete the project and related data using parameterized queries
        cursor.execute("DELETE FROM Projects WHERE project_id = %s", (project_id,))
        cursor.execute("DELETE FROM ArchivedProjects WHERE id = %s", (project_id,))
        cursor.execute("DELETE FROM Tasks WHERE project_id = %s", (project_id,))
        cursor.execute("DELETE FROM EmployeeTasks WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = %s)", (project_id,))
        cursor.execute("DELETE FROM ArchivedTasks WHERE project_id = %s", (project_id,))
        cursor.execute("DELETE FROM EmployeeProjects WHERE project_id = %s", (project_id,))
        cursor.execute("DELETE FROM PrerequisiteTasks WHERE task_id IN (SELECT task_id FROM Tasks WHERE project_id = %s)", (project_id,))
        cursor.execute("DELETE FROM ProjectTags WHERE project_id = %s", (project_id,))
        
        # Commit changes to the database
        commit_changes(db)
        return jsonify({"success": True, "message": "Project deleted successfully."}), 200
    
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

# Function to delete a project from archived projects
@app.route("/delete_archived_project", methods=["DELETE"])
def delete_archived_project():
    try:
        project_id = request.args.get("project_id")
        if not project_id:
            return jsonify({"error": "Project ID is required."}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Delete the project from the archived projects
        cursor.execute("DELETE FROM ArchivedProjects WHERE id = %s", (project_id,))
        
        # Commit changes to the database
        commit_changes(db)
        return jsonify({"success": True, "message": "Archived project deleted successfully."}), 200
    
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

# Function to get all projects
@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        db = get_db()
        cursor = db.cursor()

        # Fetch all projects using dict_cursor to return the results as dictionaries
        query = "SELECT * FROM Projects"
        projects = dict_cursor(cursor, query)  # Using dict_cursor to fetch the rows as dictionaries

        return jsonify(projects)
    
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

    
@app.route('/tasks/team_leader', methods=['GET'])
def get_tasks_by_team_leader():
    try:
        team_leader_id = request.args.get('team_leader_id')
        if not team_leader_id:
            return jsonify({"error": "Team leader ID is required."}), 400
        
        db = get_db()
        cursor = db.cursor()
        query = """
        SELECT t.*
        FROM Tasks t
        JOIN Projects p ON t.project_id = p.project_id
        WHERE p.team_leader_id = %s
        """
        
        # Use dict_cursor to fetch the tasks as dictionaries
        tasks = dict_cursor(cursor, query, (team_leader_id,))

        if not tasks:
            return jsonify({"message": "No tasks found for this team leader."}), 404

        return jsonify(tasks), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500


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
        query += " AND employee_email LIKE %s"
        params.append(f"%{employee_email}%")
    if user_type_id:
        query += " AND user_type_id = %s"
        params.append(user_type_id)
    if employee_id:
        query += " AND employee_id = %s"
        params.append(employee_id)
    if first_name:
        query += " AND first_name LIKE %s"
        params.append(f"%{first_name}%")
    if second_name:
        query += " AND second_name LIKE %s"
        params.append(f"%{second_name}%")        
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        employees = dict_cursor(cursor, query, params)
        return jsonify([dict(employee) for employee in employees])
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

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
        query += " AND p.project_name LIKE %s"
        params.append(f"%{project_name}%")
    if team_leader_id:
        query += " AND p.team_leader_id = %s"
        params.append(team_leader_id)
    if completed is not None:
        query += " AND p.completed = %s"
        params.append(completed)
    if start_date:
        query += " AND p.start_date = %s"
        params.append(start_date)
    if finish_date:
        query += " AND p.finish_date = %s"
        params.append(finish_date)
    if authorised_by:
        query += " AND p.authorised_by = %s"
        params.append(authorised_by)
    if employee_id:
        query += " AND ep.employee_id = %s"
        params.append(employee_id)
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        projects = dict_cursor(cursor, query, params)
        project_list = []
        # Appends boolean for archived status of each project
        for proj in projects:
            proj_dict = dict(proj)
            proj_dict['archived'] = is_project_archived(proj['project_id'])
            project_list.append(proj_dict)
        return jsonify(project_list)
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

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
        
        # Use dict_cursor to fetch results as dictionaries
        posts = dict_cursor(cursor, query, (params,))

        # Add the 'archived' status to each post
        for post in posts:
            post['archived'] = is_task_archived_local(post['post_id'])

        return jsonify(posts)
    except mysql.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

@app.route('/employees/tasks', methods=['GET'])
def search_employees_tasks():
    task_id = request.args.get('task_id')
    query = """
        SELECT e.employee_id, e.first_name, e.last_name
        FROM EmployeeTasks et
        JOIN Employees e ON et.employee_id = e.employee_id
        WHERE et.task_id = ?
    """
    try:
        db = get_db()
        cursor = db.cursor()

        # Use dict_cursor to fetch results as dictionaries
        employees = dict_cursor(cursor, query, (task_id,))

        return jsonify([
            {"employee_id": row["employee_id"], "employee_name": f"{row['first_name']} {row['last_name']}"}
            for row in employees
        ])
    except mysql.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

@app.route('/employees/projects', methods=['GET'])
def search_employees_projects():
    project_id = request.args.get('project_id')
    query = "SELECT employee_id FROM EmployeeProjects WHERE project_id = ?"

    try:
        db = get_db()
        cursor = db.cursor()

        # Use dict_cursor to fetch results as dictionaries
        employees = dict_cursor(cursor, query, (project_id,))

        return jsonify([row['employee_id'] for row in employees])
    except mysql.DatabaseError as e:
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
    authorised = request.args.get('authorised')

    query = """
    SELECT t.*
    FROM Tasks t
    JOIN EmployeeTasks et ON t.task_id = et.task_id
    WHERE 1=1
    """
    params = []

    if task_name:
        query += " AND t.task_name LIKE %s"
        params.append(f"%{task_name}%")
    if project_id:
        query += " AND t.project_id = %s"
        params.append(project_id)
    if completed is not None:
        query += " AND t.completed = %s"
        params.append(completed)
    if start_date:
        query += " AND t.start_date = %s"
        params.append(start_date)
    if finish_date:
        query += " AND t.finish_date = %s"
        params.append(finish_date)
    if employee_id:
        query += " AND et.employee_id = %s"
        params.append(employee_id)
    if authorised:
        query += " AND t.authorised = %s"
        params.append(authorised)

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(query, params)
        tasks = dict_cursor(cursor, query, params)

        task_list = []
        # Appends boolean for archived status of each task
        for task in tasks:
            task_dict = dict(task)
            task_dict['archived'] = is_task_archived_local(task['task_id'])
            task_list.append(task_dict)

        return jsonify(task_list)
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

# Search function for Projects by team leader
@app.route('/projects/team_leader', methods=['GET'])
def get_projects_by_team_leader():
    try:
        team_leader_id = request.args.get('team_leader_id')
        if not team_leader_id:
            return jsonify({"error": "Team leader ID is required."}), 400
        
        db = get_db()
        cursor = db.cursor()
        query = """
        SELECT p.*
        FROM Projects p
        WHERE p.team_leader_id = %s
        """
        cursor.execute(query, (team_leader_id,))
        projects = dict_cursor(cursor, query, (team_leader_id,))
        if not projects:
            return jsonify({"message": "No projects found for this team leader."}), 404

        project_list = [dict(project) for project in projects]
        return jsonify(project_list), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

@app.route("/all_tags", methods=["GET"])
def all_tags():
    try:
        db = get_db()
        cursor = db.cursor()
        query = "SELECT * FROM Tags"

        # Use dict_cursor to fetch results as dictionaries
        tags = dict_cursor(cursor, query)

        return jsonify(tags)
    except mysql.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

@app.route('/projects/tags', methods=['GET'])
def search_projects_tags():
    tag_name = request.args.get('tag_name') or ""
    query = "SELECT * FROM Tags"
       
    try:
        db = get_db()
        cursor = db.cursor()
        
        if tag_name != "":
            projects = dict_cursor(cursor,query, (tag_name,))
        else:
            projects = dict_cursor(cursor,query)
        
        return jsonify([row['project_id'] for row in projects])
    except mysql.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

@app.route('/tasks/tags', methods=['GET'])
def search_tasks_tags():
    tag_name = request.args.get('tag_name')
    query = "SELECT task_id FROM Tasks WHERE project_id IN (SELECT project_id FROM ProjectTags WHERE tag_name = ?)"
    
    try:
        db = get_db()
        cursor = db.cursor()
        # Use dict_cursor to fetch results as dictionaries
        tasks = dict_cursor(cursor, query, (tag_name,))

        return jsonify([row['task_id'] for row in tasks])
    except mysql.DatabaseError as e:
        return jsonify({"error": f"Database error: {str(e)}. Please try again later."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}. Please try again later."}), 500

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

        # Use dict_cursor to fetch results as dictionaries
        tasks_employees = dict_cursor(cursor, query, (project_id,))

        return jsonify(tasks_employees)
    except mysql.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."

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

        # Use dict_cursor to fetch the result as a dictionary
        employee_details = dict_cursor(cursor,query, (employee_id,))

        if not employee_details:
            return jsonify({'error': 'Employee not found'}), 404
        
        return jsonify(employee_details[0])  # Return the first item (should be one employee)
    except mysql.DatabaseError as e:
        return f"Database error: {str(e)}. Please try again later."
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}. Please try again later."




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
    while True:
        schedule.run_pending()
        time.sleep(1)
