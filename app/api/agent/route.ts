import { NextRequest } from "next/server";

import { createAgentForProject } from "@/lib/agent/agent";
import { sandbox } from "@/lib/sandbox/sandbox-manager";

export async function POST(
  request: NextRequest
) {
  await sandbox.start();

  try {
    const body = await request.json();
    const agent = createAgentForProject(body?.project)

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: body.prompt,
        },
      ],
    });

    return Response.json(result);
  } finally {
    await sandbox.stop();
  }
}