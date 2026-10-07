import type { SandboxProcess } from "./process";

type OutputCallback = (
    pid: number,
    stream: "stdout" | "stderr",
    data: string
) => void;

class ProcessManager {
    private processes = new Map<number, SandboxProcess>();
    private listeners = new Set<OutputCallback>();

    add(process: SandboxProcess) {
        this.processes.set(process.pid, process);

        process.onStdout((data) => {
            this.emit(process.pid, "stdout", data);
        });

        process.onStderr((data) => {
            this.emit(process.pid, "stderr", data);
        });
    }

    subscribe(callback: OutputCallback) {
        this.listeners.add(callback);

        return () => {
            this.listeners.delete(callback);
        };
    }

    private emit(
        pid: number,
        stream: "stdout" | "stderr",
        data: string
    ) {
        console.log("PROCESS OUTPUT:", {
            pid,
            stream,
            data,
        });

        for (const listener of this.listeners) {
            listener(pid, stream, data);
        }
    }

    get(pid: number) {
        return this.processes.get(pid);
    }

    async stop(pid: number) {
        const process = this.processes.get(pid);

        if (!process) return;

        await process.stop();

        this.processes.delete(pid);
    }
}

const globalForProcessManager =
    globalThis as unknown as {
        processManager?: ProcessManager;
    };

export const processManager =
    globalForProcessManager.processManager ??
    new ProcessManager();

if (process.env.NODE_ENV !== "production") {
    globalForProcessManager.processManager = processManager;
}