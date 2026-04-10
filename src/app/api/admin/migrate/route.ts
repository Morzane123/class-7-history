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
