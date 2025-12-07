-- Migration number: 0001 	 2024-12-07T00:00:00.000Z
DROP TABLE IF EXISTS players;
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON blob
    last_login INTEGER
);
CREATE INDEX idx_username ON players(username);
