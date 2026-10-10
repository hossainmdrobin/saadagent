import { Conversation } from "@/store/features/conversation-api";
import { Dispatch, SetStateAction } from 'react';

interface props {
    conversations: Conversation[],
    setConversationId: (id:string)=>void;
}

export const ChatHistory = ({ conversations = [],setConversationId }: props) => {

    return (
        <div className="my-1 shadow rounded bg-white ">
            <h3 className="p-2">Chats</h3>
            {
                conversations?.map(item =>
                    <div 
                    onClick={()=>setConversationId(item.id)}
                     className="my-1 rounded bg-white hover:bg-gray-300 p-2">
                        {item.id.slice(-4) + " - " + item.title}
                    </div>
                )
            }
        </div>
    )
}