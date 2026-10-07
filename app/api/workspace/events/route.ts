import { watchWorkspace } from "@/lib/workspace/watcher";
import { processManager } from "@/lib/sandbox/process-manager";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let stopWatching = () => {};
      let stopProcessListener = () => {};
      let heartbeat: ReturnType<typeof setInterval> | undefined;

      const close = () => {
        if (closed) return;

        closed = true;

        if (heartbeat) {
          clearInterval(heartbeat);
        }

        stopWatching();
        stopProcessListener();

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

      send({ type: "connected" });

      // File changes
      stopWatching = watchWorkspace((event) => {
        send(event);
      });

      // Process stdout/stderr
      stopProcessListener =     // PEOCESS MANEGER: WHAT DOES IT DO ?
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

      heartbeat = setInterval(() => {
        send({ type: "heartbeat" });
      }, 30_000);

      request.signal.addEventListener(
        "abort",
        close
      );
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