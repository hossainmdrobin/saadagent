"use client";

import { useHomeState } from "./home/use-home-state";
import { useFileCallbacks } from "./home/use-file-callbacks";
import { useAgentCallbacks } from "./home/use-agent-callbacks";
import { useWorkspaceEffects } from "./home/use-workspace-effects";
import { HomeHeader } from "./home/header";
import { HomePanels } from "./home/panels";

export default function Home() {
  const state = useHomeState();
  const fileOps = useFileCallbacks(state);
  const agentOps = useAgentCallbacks(state);
  useWorkspaceEffects(state, fileOps);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0b0f17] text-zinc-200">
      <HomeHeader state={state} agent={agentOps} />
      <div className="relative flex min-h-0 flex-1">
        <HomePanels state={state} fileOps={fileOps} />
      </div>
    </div>
  );
}
