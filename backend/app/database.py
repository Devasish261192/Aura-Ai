import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from .config import SQLITE_DB_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    conn = get_db_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                tool_calls TEXT,
                tool_results TEXT,
                is_voice INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS artifact_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artifact_name TEXT NOT NULL,
                operation TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            );
        """)
    conn.close()

def save_chat_message(
    session_id: str,
    role: str,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None,
    tool_results: Optional[List[Dict[str, Any]]] = None,
    is_voice: bool = False
) -> int:
    conn = get_db_connection()
    with conn:
        cur = conn.execute("""
            INSERT INTO chat_messages (session_id, role, content, tool_calls, tool_results, is_voice, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            role,
            content,
            json.dumps(tool_calls) if tool_calls else None,
            json.dumps(tool_results) if tool_results else None,
            1 if is_voice else 0,
            datetime.utcnow().isoformat() + "Z"
        ))
        msg_id = cur.lastrowid
    conn.close()
    return msg_id

def get_chat_history(session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.execute("""
        SELECT id, session_id, role, content, tool_calls, tool_results, is_voice, created_at
        FROM (
            SELECT id, session_id, role, content, tool_calls, tool_results, is_voice, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT ?
        )
        ORDER BY id ASC
    """, (session_id, limit))
    rows = cur.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "session_id": r["session_id"],
            "role": r["role"],
            "content": r["content"],
            "tool_calls": json.loads(r["tool_calls"]) if r["tool_calls"] else None,
            "tool_results": json.loads(r["tool_results"]) if r["tool_results"] else None,
            "is_voice": bool(r["is_voice"]),
            "created_at": r["created_at"]
        })
    return results

def log_artifact_mutation(artifact_name: str, operation: str, details: Optional[Dict[str, Any]] = None):
    conn = get_db_connection()
    with conn:
        conn.execute("""
            INSERT INTO artifact_logs (artifact_name, operation, details, timestamp)
            VALUES (?, ?, ?, ?)
        """, (
            artifact_name,
            operation,
            json.dumps(details) if details else None,
            datetime.utcnow().isoformat() + "Z"
        ))
    conn.close()
