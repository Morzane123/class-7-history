import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const columnNames = tableInfo.map(col => col.name);
    
    if (!columnNames.includes("is_class7")) {
      db.exec("ALTER TABLE users ADD COLUMN is_class7 INTEGER DEFAULT 1");
      console.log("Added column: is_class7");
    }
    
    if (!columnNames.includes("class_name")) {
      db.exec("ALTER TABLE users ADD COLUMN class_name TEXT");
      console.log("Added column: class_name");
    }
    
    return NextResponse.json({ 
      message: "数据库迁移成功",
      columns: columnNames,
      added: {
        is_class7: !columnNames.includes("is_class7") ? "已添加" : "已存在",
        class_name: !columnNames.includes("class_name") ? "已添加" : "已存在"
      }
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      error: "迁移失败", 
      details: error instanceof Error ? error.message : "未知错误" 
    }, { status: 500 });
  }
}
