import Database from "better-sqlite3";
import { join } from "path";
import { hashSync } from "bcryptjs";

const dbPath = join(process.cwd(), "data", "class7history.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dataDir = join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initDatabase(db);
  }
  return db;
}

function initDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT,
      role INTEGER DEFAULT 1,
      is_class7 INTEGER DEFAULT 1,
      class_name TEXT,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      event_date TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES sections(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS event_images (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );
  `);

  const sectionsCount = db.prepare("SELECT COUNT(*) as count FROM sections").get() as { count: number };
  if (sectionsCount.count === 0) {
    const insertSection = db.prepare(
      "INSERT INTO sections (id, name, description, sort_order) VALUES (?, ?, ?, ?)"
    );
    insertSection.run("internal", "内政", "班级内部事务与管理", 1);
    insertSection.run("diplomacy", "外交", "班级对外交流与活动", 2);
    insertSection.run("livelihood", "民生", "班级日常生活与趣事", 3);
  }

  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (usersCount.count === 0) {
    const hashedPassword = hashSync("admin123456", 10);
    const insertUser = db.prepare(
      "INSERT INTO users (id, email, password, nickname, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)"
    );
    insertUser.run("admin-super", "admin@class7history.local", hashedPassword, "超级管理员", 3, 1);
  }
}

export interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
  avatar: string | null;
  role: number;
  is_class7: number;
  class_name: string | null;
  email_verified: number;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expires: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Event {
  id: string;
  section_id: string;
  title: string;
  content: string;
  event_date: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: User;
  section?: Section;
  images?: EventImage[];
}

export interface EventImage {
  id: string;
  event_id: string;
  image_path: string;
  sort_order: number;
}

export async function getSections(): Promise<Section[]> {
  const db = getDb();
  return db.prepare("SELECT * FROM sections ORDER BY sort_order").all() as Section[];
}

export async function getSectionById(id: string): Promise<Section | null> {
  const db = getDb();
  const section = db.prepare("SELECT * FROM sections WHERE id = ?").get(id);
  return section ? (section as Section) : null;
}

export async function getEvents(options?: {
  sectionId?: string;
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}): Promise<Event[]> {
  const db = getDb();
  let sql = `
    SELECT e.*, u.nickname as author_name, u.avatar as author_avatar, s.name as section_name
    FROM events e
    LEFT JOIN users u ON e.author_id = u.id
    LEFT JOIN sections s ON e.section_id = s.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (options?.sectionId) {
    sql += " AND e.section_id = ?";
    params.push(options.sectionId);
  }

  if (options?.year) {
    sql += " AND strftime('%Y', e.event_date) = ?";
    params.push(options.year.toString());
  }

  if (options?.month) {
    sql += " AND strftime('%m', e.event_date) = ?";
    params.push(options.month.toString().padStart(2, "0"));
  }

  sql += " ORDER BY e.event_date DESC";

  if (options?.limit) {
    sql += " LIMIT ?";
    params.push(options.limit);
  }

  if (options?.offset) {
    sql += " OFFSET ?";
    params.push(options.offset);
  }

  const events = db.prepare(sql).all(...params) as (Event & { author_name: string; author_avatar: string | null; section_name: string })[];

  return events.map((e) => ({
    ...e,
    author: {
      id: e.author_id,
      nickname: e.author_name,
      avatar: e.author_avatar,
    } as User,
    section: {
      id: e.section_id,
      name: e.section_name,
    } as Section,
  }));
}

export async function getEventById(id: string): Promise<Event | null> {
  const db = getDb();
  const event = db.prepare(`
    SELECT e.*, u.nickname as author_name, u.avatar as author_avatar, s.name as section_name
    FROM events e
    LEFT JOIN users u ON e.author_id = u.id
    LEFT JOIN sections s ON e.section_id = s.id
    WHERE e.id = ?
  `).get(id);

  if (!event) return null;

  const images = db.prepare("SELECT * FROM event_images WHERE event_id = ? ORDER BY sort_order").all(id) as EventImage[];

  return {
    ...(event as Event & { author_name: string; author_avatar: string | null; section_name: string }),
    author: {
      id: (event as Event).author_id,
      nickname: (event as any).author_name,
      avatar: (event as any).author_avatar,
    } as User,
    section: {
      id: (event as Event).section_id,
      name: (event as any).section_name,
    } as Section,
    images,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return user ? (user as User) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return user ? (user as User) : null;
}

export async function createUser(data: {
  id: string;
  email: string;
  password: string;
  nickname: string;
  verificationToken: string;
  is_class7?: number;
  class_name?: string;
}): Promise<User> {
  const db = getDb();
  const isClass7Value = data.is_class7 !== undefined ? data.is_class7 : 1;
  db.prepare(`
    INSERT INTO users (id, email, password, nickname, verification_token, is_class7, class_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.email, data.password, data.nickname, data.verificationToken, isClass7Value, data.class_name || null);
  
  return getUserById(data.id) as Promise<User>;
}

export async function verifyEmail(token: string): Promise<boolean> {
  const db = getDb();
  const result = db.prepare(`
    UPDATE users SET email_verified = 1, verification_token = NULL 
    WHERE verification_token = ?
  `).run(token);
  return result.changes > 0;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "id" && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  
  return getUserById(id);
}

export async function createEvent(data: {
  id: string;
  section_id: string;
  title: string;
  content: string;
  event_date: string;
  author_id: string;
}): Promise<Event> {
  const db = getDb();
  db.prepare(`
    INSERT INTO events (id, section_id, title, content, event_date, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.id, data.section_id, data.title, data.content, data.event_date, data.author_id);
  
  return getEventById(data.id) as Promise<Event>;
}

export async function updateEvent(id: string, data: {
  section_id?: string;
  title?: string;
  content?: string;
  event_date?: string;
}): Promise<Event | null> {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "id" && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return getEventById(id);

  values.push(id);
  db.prepare(`UPDATE events SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  
  return getEventById(id);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = getDb();
  const result = db.prepare("DELETE FROM events WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function createSection(data: {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}): Promise<Section> {
  const db = getDb();
  db.prepare(`
    INSERT INTO sections (id, name, description, sort_order)
    VALUES (?, ?, ?, ?)
  `).run(data.id, data.name, data.description, data.sort_order);
  
  return getSectionById(data.id) as Promise<Section>;
}

export async function updateSection(id: string, data: Partial<Section>): Promise<Section | null> {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "id" && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return getSectionById(id);

  values.push(id);
  db.prepare(`UPDATE sections SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  
  return getSectionById(id);
}

export async function deleteSection(id: string): Promise<boolean> {
  const db = getDb();
  const result = db.prepare("DELETE FROM sections WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDb();
  return db.prepare("SELECT id, email, nickname, avatar, role, is_class7, class_name, email_verified, created_at FROM users ORDER BY created_at DESC").all() as User[];
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user?: { id: string; nickname: string; avatar: string | null; is_class7?: number; class_name?: string | null };
  replies?: Comment[];
}

export async function getCommentsByEventId(eventId: string): Promise<Comment[]> {
  const db = getDb();
  const comments = db.prepare(`
    SELECT c.*, u.nickname as user_name, u.avatar as user_avatar, u.is_class7 as user_is_class7, u.class_name as user_class_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.event_id = ?
    ORDER BY c.created_at ASC
  `).all(eventId) as (Comment & { user_name: string; user_avatar: string | null; user_is_class7: number; user_class_name: string | null })[];

  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  comments.forEach((c) => {
    const comment: Comment = {
      ...c,
      user: { id: c.user_id, nickname: c.user_name, avatar: c.user_avatar, is_class7: c.user_is_class7, class_name: c.user_class_name },
      replies: [],
    };
    commentMap.set(c.id, comment);
  });

  comments.forEach((c) => {
    const comment = commentMap.get(c.id)!;
    if (c.parent_id) {
      const parent = commentMap.get(c.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export async function createComment(data: {
  id: string;
  event_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
}): Promise<Comment> {
  const db = getDb();
  db.prepare(`
    INSERT INTO comments (id, event_id, user_id, parent_id, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.id, data.event_id, data.user_id, data.parent_id, data.content);

  const comment = db.prepare(`
    SELECT c.*, u.nickname as user_name, u.avatar as user_avatar, u.is_class7 as user_is_class7, u.class_name as user_class_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(data.id) as Comment & { user_name: string; user_avatar: string | null; user_is_class7: number; user_class_name: string | null };

  return {
    ...comment,
    user: { id: comment.user_id, nickname: comment.user_name, avatar: comment.user_avatar, is_class7: comment.user_is_class7, class_name: comment.user_class_name },
    replies: [],
  };
}

export async function deleteComment(id: string, userId: string): Promise<boolean> {
  const db = getDb();
  const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(id) as Comment | undefined;
  
  if (!comment || comment.user_id !== userId) {
    return false;
  }

  db.prepare("DELETE FROM comments WHERE id = ?").run(id);
  return true;
}
