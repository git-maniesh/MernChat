import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.type";
import { useEffect, useRef, useState } from "react";
import ChatBodyMessage from "./chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
}
const ChatBody = ({ chatId, messages, onReply }: Props) => {
  const { socket } = useSocket();
  const { addNewMessage, addOrUpdateMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [_, setAiChunk] = useState<string>("");

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;

    const handleNewMessage = (msg: MessageType) => addNewMessage(chatId, msg);

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, chatId, addNewMessage]);

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;
    const handleAIStream = ({
      chatId:streamChatId,
      chunk,
      done,
      message
    }:any) => {
      if(streamChatId !== chatId) return;

      const lastMsg  = messages.at(-1)
      if(!lastMsg?._id && lastMsg?.streaming){
        return ;
      }
      if(chunk?.trim()&& !done){
        setAiChunk((prev)=>{
          const newContent = prev + chunk;
          addOrUpdateMessage(
            chatId,
            {
              ...lastMsg,
              content:newContent,
            }as MessageType,
            lastMsg?._id
          )
          return newContent;
        })
        return;
      }
      if(done){
        console.log("ai fullmessage", message)
        setAiChunk("")
      }
    }
    // const handleAIStream = ({
    //   chatId: streamChatId,
    //   chunk,
    //   done,
    //   message,
    // }: any) => {
    //   if (streamChatId !== chatId) return;

    //   let lastMsg = messages.at(-1);

    //   // ✅ If no streaming message exists yet → create a placeholder
    //   if (!lastMsg || !lastMsg.streaming) {
    //     const placeholder: MessageType = {
    //       _id: undefined as any,
    //       chatId,
    //       sender: { _id: "AI", name: "Whop AI", avatar: "" },
    //       content: "",
    //       streaming: true,
    //     };
    //     addNewMessage(chatId, placeholder);
    //     lastMsg = placeholder;
    //   }

    //   // ✅ When receiving chunks
    //   if (chunk?.trim() && !done) {
    //     setAiChunk((prev) => {
    //       const newContent = prev + chunk;
    //       addOrUpdateMessage(
    //         chatId,
    //         { ...lastMsg, content: newContent } as MessageType,
    //         lastMsg._id
    //       );
    //       return newContent;
    //     });
    //     return;
    //   }

    //   // ✅ When streaming is finished
    //   if (done) {
    //     setAiChunk("");
    //     addOrUpdateMessage(chatId, message, lastMsg._id);
    //   }
    // };

    // const handleAIStream = ({
    //   chatId: streamChatId,
    //   chunk,
    //   done,
    //   message,
    // }: any) => {
    //   if (streamChatId !== chatId) return;

    //   const lastMsg = messages.at(-1);

    //   // If last message is a streaming placeholder and
    //   // we haven't received any new chunk yet, don't early return here
    //   // (your current return stops updates incorrectly)

    //   // STREAMING IN PROGRESS
    //   if (chunk?.trim() && !done) {
    //     setAiChunk((prev) => {
    //       const newContent = prev + chunk;

    //       addOrUpdateMessage(
    //         chatId,
    //         {
    //           ...lastMsg,
    //           content: newContent,
    //           streaming: true, // ✅ keep showing typing animation
    //         } as MessageType,
    //         lastMsg?._id
    //       );

    //       return newContent;
    //     });

    //     return;
    //   }

    //   // STREAMING FINISHED ✅
    //   if (done) {
    //     setAiChunk("");

    //     addOrUpdateMessage(
    //       chatId,
    //       {
    //         ...message,
    //         streaming: false, // ✅ IMPORTANT — stop bounce UI
    //       } as MessageType,
    //       lastMsg?._id
    //     );

    //     return;
    //   }
    // };

    socket.on("chat:ai", handleAIStream);

    return () => {
      socket.off("chat:ai", handleAIStream);
    };
  }, [addOrUpdateMessage, chatId, messages, socket]);

  useEffect(() => {
    if (!messages.length) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col px-3 py-2">
      {messages.map((message) => (
        <ChatBodyMessage
          key={message._id}
          message={message}
          onReply={onReply}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBody;
