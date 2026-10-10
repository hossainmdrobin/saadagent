import { Conversation } from "@/store/features/conversation-api";

interface Props {
    conversations: Conversation[];
    conversationId: string;
    setConversationId: (id: string) => void;
}

export const ChatHistory = ({
    conversations = [],
    conversationId,
    setConversationId,
}: Props) => {
    return (
        <div className="my-1 rounded bg-white shadow">
            <h3 className="p-2 font-semibold">Chats</h3>

            {conversations.length === 0 ? (
                <p className="p-2 text-sm text-gray-500">
                    No conversations yet.
                </p>
            ) : (
                conversations.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setConversationId(item.id)}
                        className={`my-1 cursor-pointer rounded p-2 ${conversationId === item.id
                                ? "bg-blue-100 text-blue-900"
                                : "bg-white hover:bg-gray-100"
                            }`}
                    >
                        <p className="truncate text-sm font-medium">
                            {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                            Chat ID: {item.id.slice(-4)}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
};