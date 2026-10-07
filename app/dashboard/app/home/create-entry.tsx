import type { ConsoleEntry } from "@/components/ide/preview-pane";

let entryCounter = 0;

export function createEntry(
  kind: ConsoleEntry["kind"],
  text: string,
  label?: string,
): ConsoleEntry {
  entryCounter += 1;

  return {
    id: entryCounter,
    kind,
    text,
    label,
    time: new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}
