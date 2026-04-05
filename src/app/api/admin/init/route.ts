import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const db = getDb();
    
    const existingAdmin = db.prepare("SELECT * FROM users WHERE role = 3").get();
    
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "管理员账号已存在",
        admin: {
          id: (existingAdmin as any).id,
          email: (existingAdmin as any).email,
          nickname: (existingAdmin as any).nickname,
          role: (existingAdmin as any).role
        }
      });
    }

    const hashedPassword = hashSync("admin123456", 10);
    
    db.prepare(`
      INSERT INTO users (id, email, password, nickname, role, email_verified) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("admin-super", "admin@class7history.local", hashedPassword, "超级管理员", 3, 1);

    return NextResponse.json({ 
      message: "管理员账号创建成功",
      admin: {
        id: "admin-super",
        email: "admin@class7history.local",
        nickname: "超级管理员",
        role: 3
      },
      password: "admin123456"
    });
  } catch (error) {
    console.error("Init admin error:", error);
    return NextResponse.json({ error: "初始化失败" }, { status: 500 });
  }
}
