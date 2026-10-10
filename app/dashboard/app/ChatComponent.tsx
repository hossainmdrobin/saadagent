import { AgentEvent } from "./types";
import { ChatPanel } from "./components/chat-panel";

export default function ChatComponent({ events }: { events: AgentEvent[] }) {
  return <ChatPanel events={events} />;
}