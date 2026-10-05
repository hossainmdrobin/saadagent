import { watchWorkspace } from "@/lib/workspace/watcher";

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
