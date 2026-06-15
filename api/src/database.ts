import Database from "better-sqlite3"

const db = new Database("../database/database.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start TEXT,
    end TEXT,
    userid INTEGER,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
    );
`);

export default db;