import { NextResponse } from "next/server";
import { getRandomQuestion } from "@/lib/questions";

export async function GET() {
  try {
    const question = getRandomQuestion();
    return NextResponse.json({ 
      question: {
        id: question.id,
        question: question.question
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "获取问题失败" }, { status: 500 });
  }
}
