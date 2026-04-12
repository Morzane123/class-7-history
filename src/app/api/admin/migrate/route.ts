import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const columnNames = tableInfo.map(col => col.name);

    const migrations: string[] = [];

    if (!columnNames.includes("approved")) {
      db.exec("ALTER TABLE users ADD COLUMN approved INTEGER DEFAULT 1");
      migrations.push("approved: 已添加");
    } else {
      migrations.push("approved: 已存在");
    }

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    if (!tableNames.includes("event_videos")) {
      db.exec(`
        CREATE TABLE event_videos (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL,
          video_path TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )
      `);
      migrations.push("event_videos表: 已添加");
    } else {
      migrations.push("event_videos表: 已存在");
    }

    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all() as { name: string }[];
    const indexNames = indexes.map(i => i.name);

    const indexesToCreate = [
      { name: "idx_events_section", table: "events", column: "section_id" },
      { name: "idx_events_author", table: "events", column: "author_id" },
      { name: "idx_events_date", table: "events", column: "event_date" },
      { name: "idx_comments_event", table: "comments", column: "event_id" },
      { name: "idx_comments_parent", table: "comments", column: "parent_id" },
      { name: "idx_comments_user", table: "comments", column: "user_id" },
      { name: "idx_images_event", table: "event_images", column: "event_id" },
      { name: "idx_videos_event", table: "event_videos", column: "event_id" },
    ];

    for (const idx of indexesToCreate) {
      if (!indexNames.includes(idx.name)) {
        db.exec(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`);
        migrations.push(`索引 ${idx.name}: 已添加`);
      } else {
        migrations.push(`索引 ${idx.name}: 已存在`);
      }
    }

    return NextResponse.json({
      message: "数据库迁移成功",
      migrations
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({
      error: "迁移失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 });
  }
}
