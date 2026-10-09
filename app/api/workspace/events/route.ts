
import { watchWorkspace } from "@/lib/workspace/watcher";
import { processManager } from "@/lib/sandbox/process-manager";
import { projectManager } from "@/lib/workspace/project-manager";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get("project");

    if (
        !project ||
        !/^[a-zA-Z0-9_-]+$/.test(project) ||
        !(await projectManager.exists(project))
    ) {
        return Response.json(
            { error: "Invalid or unknown project" },
            { status: 400 }
        );
    }

    const encoder = new TextEncoder();

    let closed = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    let stopWatching = () => {};
    let stopProcessListener = () => {};
    let stopProcessListListener = () => {};
    let stopPreviewListener = () => {};

    const stream = new ReadableStream({
        start(controller) {
            const close = () => {
                if (closed) return;
                closed = true;

                if (heartbeat) clearInterval(heartbeat);

                stopWatching();
                stopProcessListener();
                stopProcessListListener();
                stopPreviewListener();

                request.signal.removeEventListener("abort", close);

                try {
                    controller.close();
                } catch {}
            };

            const send = (data: unknown) => {
                if (closed) return;

                try {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify(data)}\n\n`
                        )
                    );
                } catch {
                    close();
                }
            };

            const getProjectProcesses = () =>
                processManager.list().filter(
                    (process) => process.project === project
                );

            const sendProcesses = () => {
                send({
                    type: "processes",
                    processes: getProjectProcesses(),
                });
            };

            // Only this project's files are watched.
            stopWatching = watchWorkspace(project, (event) => {
                send(event);
            });

            // Only this project's process output is sent.
            stopProcessListener = processManager.subscribe(
                (pid, outputStream, data) => {
                    const belongsToProject = getProjectProcesses()
                        .some((process) => process.pid === pid);

                    if (!belongsToProject) return;

                    send({
                        type: "process_output",
                        pid,
                        stream: outputStream,
                        data,
                    });
                }
            );

            // Send only this project's process list.
            stopProcessListListener =
                processManager.subscribeProcesses(sendProcesses);

            // Only preview URLs from this project's processes.
            stopPreviewListener = processManager.subscribePreview(
                (pid, url) => {
                    const belongsToProject = getProjectProcesses()
                        .some((process) => process.pid === pid);

                    if (!belongsToProject) return;

                    send({
                        type: "preview",
                        pid,
                        url,
                    });
                }
            );

            send({ type: "connected", project });
            sendProcesses();

            heartbeat = setInterval(() => {
                send({ type: "heartbeat" });
            }, 30_000);

            request.signal.addEventListener("abort", close);
        },

        cancel() {
            if (closed) return;
            closed = true;

            if (heartbeat) clearInterval(heartbeat);

            stopWatching();
            stopProcessListener();
            stopProcessListListener();
            stopPreviewListener();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}