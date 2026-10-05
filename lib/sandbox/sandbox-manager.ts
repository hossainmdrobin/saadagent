import { LocalSandbox } from "./local-sandbox";
import type { Sandbox } from "./sandbox";

const workspace = `${process.cwd()}/workspace`;

export const sandbox: Sandbox = new LocalSandbox(
  workspace
);