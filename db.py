import sqlite3
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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age TEXT NOT NULL
            )
        ''')
        db.commit()


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
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return "SQLite instance is running!"



if __name__ == '__main__':
    app.run(port=PORT)
    init_db()
