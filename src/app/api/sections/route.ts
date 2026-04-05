import { NextResponse } from "next/server";
import { getSections } from "@/lib/db";

export async function GET() {
  try {
    const sections = await getSections();
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Get sections error:", error);
    return NextResponse.json(
      { error: "获取板块列表失败" },
      { status: 500 }
    );
  }
}
