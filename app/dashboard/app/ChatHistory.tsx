import { Conversation } from "@/store/features/conversation-api"


export const ChatHistory = ({ conversations = [] }: { conversations: Conversation[] }) => {

    return (
        <div>
            {
                conversations?.map(item =>
                    <div>
                        {item.id.slice(-4) + " - " + item.title}
                    </div>
                )
            }
        </div>
    )
}