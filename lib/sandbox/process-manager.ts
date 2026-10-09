import type { SandboxProcess } from "./process";

export type ManagedProcess = {
    process: SandboxProcess;
    command: string;
    cwd?: string;
    project?: string,
    startedAt: number;
};


type OutputCallback = (
    pid: number,
    stream: "stdout" | "stderr",
    data: string
) => void;

export type PreviewCallback = (
    pid: number,
    url: string
) => void;

class ProcessManager {
    // PRIVATE FUNCTIONS AND VARIABLES
    private processes = new Map<number, ManagedProcess>();
    private listeners = new Set<OutputCallback>();
    private processListeners = new Set<() => void>();
    private previewListeners = new Set<PreviewCallback>();
    private notifyProcesses() {
        for (const listener of this.processListeners) {
            listener();
        }
    }

    add(
        process: SandboxProcess,
        command: string,
        cwd?: string,
        project?:string
    ) {
        this.processes.set(process.pid, {
            process,
            command,
            cwd,
            project,
            startedAt: Date.now(),
        });

        process.onStdout((data) => {
            this.emit(process.pid, "stdout", data);
        });

        process.onStderr((data) => {
            this.emit(process.pid, "stderr", data);
        });
        this.notifyProcesses()
    }

    list() {
        return Array.from(this.processes.values()).map(
            ({ process, command, cwd, project, startedAt }) => ({
                pid: process.pid,
                command,
                cwd,
                project,
                startedAt,
            })
        );
    }

    get(pid: number) {
        return this.processes.get(pid);
    }

    subscribe(callback: OutputCallback) {
        this.listeners.add(callback);

        return () => {
            this.listeners.delete(callback);
        };
    }
    subscribeProcesses(callback: () => void) {
        this.processListeners.add(callback);

        return () => {
            this.processListeners.delete(callback);
        };
    }

    subscribePreview(callback: PreviewCallback) {
        this.previewListeners.add(callback);

        return () => {
            this.previewListeners.delete(callback);
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
        const urlMatch = data.match(
            /https?:\/\/localhost:\d+/
        );

        if (urlMatch) {
            const url = urlMatch[0];

            for (const listener of this.previewListeners) {
                listener(pid, url);
            }
        }
    }

    async stop(pid: number) {
        const managed = this.processes.get(pid);

        if (!managed) {
            throw new Error(
                `Process ${pid} not found`
            );
        }

        await managed.process.stop();

        this.processes.delete(pid);
        this.notifyProcesses();
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