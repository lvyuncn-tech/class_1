import OpenAI from "openai";
import { Habit, Log } from "../types";

const SYSTEM_INSTRUCTION = `
你是一位温暖、热情且善于分析的个人成长教练。
你的目标是根据用户的本周习惯打卡数据，提供一份简洁、充满表情符号的中文复盘报告。
1. 总结他们的表现（完成率、总投入时间等）。
2. 选出本周的“高光时刻”或表现最好的习惯。
3. 针对表现最弱的习惯，给出一个具体、可执行的改进小建议。
4. 语气要积极向上，像朋友一样鼓励用户。
5. 使用 Markdown 格式，用清晰的标题和要点列表。
`;

export const generateWeeklyInsight = async (habits: Habit[], logs: Log[], dateRange: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Prepare data for the prompt
  const dataContext = JSON.stringify({
    period: dateRange,
    habits: habits.map(h => ({ name: h.name, goal: h.goal, unit: h.unit })),
    logs: logs.map(l => ({ habit: habits.find(h => h.id === l.habitId)?.name, date: l.date, value: l.value }))
  });

  try {
    const response = await client.chat.completions.create({
      model: "google/gemini-3-pro-preview",
      messages: [
        {
          role: "system",
          content: SYSTEM_INSTRUCTION
        },
        {
          role: "user",
          content: `这是我本周的习惯打卡数据: ${dataContext}. 请给我一份中文的周度复盘。`
        }
      ],
      // @ts-ignore: OpenRouter custom parameter
      reasoning: {
        enabled: true
      }
    } as any);

    return response.choices[0].message.content || "无法生成报告，请稍后再试。";
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    throw new Error("生成报告失败，请稍后重试。");
  }
};
