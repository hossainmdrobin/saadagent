
import { NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const expectedToken = process.env.SANDBOX_TEST_TOKEN;
    const providedToken = request.headers.get("x-sandbox-test-token");

    // Keep this temporary test endpoint private.
    if (!expectedToken) {
        return NextResponse.json(
            { success: false, error: "Sandbox test endpoint is not configured" },
            { status: 503 }
        );
    }

    if (providedToken !== expectedToken) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    let sandbox: Awaited<ReturnType<typeof Sandbox.create>> | undefined;

    try {
        // Create an isolated Linux environment.
        sandbox = await Sandbox.create({
            timeout: 2 * 60 * 1000,
        });

        // Run a harmless command inside the sandbox.
        const result = await sandbox.runCommand({
            cmd: "node",
            args: ["--version"],
        });

        const stdout = await result.stdout();
        const stderr = await result.stderr();

        return NextResponse.json({
            success: result.exitCode === 0,
            exitCode: result.exitCode,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
        });
    } catch (error) {
        console.error("Sandbox test failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create or execute the sandbox",
            },
            { status: 500 }
        );
    } finally {
        if (sandbox) {
            try {
                await sandbox.stop();
            } catch (error) {
                console.error("Failed to stop test sandbox:", error);
            }
        }
    }
}
