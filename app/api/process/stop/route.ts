import { processManager } from "@/lib/sandbox/process-manager";

export async function POST(request: Request) {
    try {
        const { pid } = await request.json();

        if (!Number.isInteger(pid)) {
            return Response.json(
                {
                    success: false,
                    error: "Invalid PID",
                },
                { status: 400 }
            );
        }

        await processManager.stop(pid);

        return Response.json({
            success: true,
            pid,
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to stop process",
            },
            { status: 500 }
        );
    }
}