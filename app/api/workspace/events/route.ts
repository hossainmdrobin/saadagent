import { watchWorkspace } from "@/lib/workspace/watcher";
import { processManager } from "@/lib/sandbox/process-manager";



export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (data: unknown) => {
        if (closed) return;

        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify(data)}\n\n`
            )
          );
        } catch {
          closed = true;
        }
      };

      send({
        type: "connected",
      });

      const stopWatching = watchWorkspace((event) => {
        send(event);
      });
      const stopProcessListener =
        processManager.subscribe(
          (pid, stream, data) => {
            send({
              type: "process_output",
              pid,
              stream,
              data,
            });
          }
        );

      const heartbeat = setInterval(() => {
        send({
          type: "heartbeat",
        });
      }, 30_000);

      const cleanup = () => {
        if (closed) return;

        closed = true;

        clearInterval(heartbeat);
        stopWatching();
        stopProcessListener()
      };

      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
