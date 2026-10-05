import { NextRequest } from "next/server";
import { agent } from "@/lib/agent/agent";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: body.prompt,
      },
    ],
  });

  return Response.json(result);
}