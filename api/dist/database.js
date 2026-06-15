"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const db = new better_sqlite3_1.default("../database/database.db");
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
exports.default = db;
