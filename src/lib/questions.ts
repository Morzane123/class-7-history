export interface Question {
  id: string;
  question: string;
  answer: string;
}

export const class7Questions: Question[] = [
  {
    id: "q1",
    question: "七班头发最少的人的名字缩写（**加粗**）是什么？",
    answer: "kwy"
  },
  {
    id: "q2",
    question: "状态这个梗出自哪个科目？",
    answer: "化学"
  },
  {
    id: "q3",
    question: "太子爷是谁？",
    answer: "龚雨儿子"
  },
  {
    id: "q4",
    question: "点头是哪个科目的梗？",
    answer: "语文"
  },
  {
    id: "q5",
    question: "鸡飞狗跳组合的名字缩写（**加粗**），空格隔开",
    answer: "mhx hwm"
  }
];

export function getRandomQuestion(): Question {
  const randomIndex = Math.floor(Math.random() * class7Questions.length);
  return class7Questions[randomIndex];
}

export function getQuestionById(id: string): Question | undefined {
  return class7Questions.find(q => q.id === id);
}

export function checkAnswer(questionId: string, userAnswer: string): boolean {
  const question = getQuestionById(questionId);
  if (!question) return false;
  
  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const correctAnswer = question.answer.toLowerCase();
  
  return normalizedAnswer === correctAnswer;
}
