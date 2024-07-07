"use client";

import { paragon } from "@useparagon/connect";
import { useChat } from "ai/react";
import { useState } from "react";
import { ChatInput, ChatMessages } from "./ui/chat";
import { useClientConfig } from "./ui/chat/hooks/use-config";

export default function ChatSection() {
  const { chatAPI } = useClientConfig();
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  } = useChat({
    api: chatAPI,
    headers: {
      "Content-Type": "application/json",
    },
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
  });

  const [channel, setChannel] = useState<string | null>(null);
  const [ts, setTs] = useState<string | null>(null);

  const sendMessage = async (content: string): Promise<void> => {
    try {
      const result = await paragon.workflow(
        "179826e6-313e-4a0b-a4e2-872eed2c69ff",
        {
          body: {
            message: "User asked the following question: " + content,
          },
        },
      );

      if (result) {
        setChannel(result.body_key.channel);
        setTs(result.body_key.message.ts);
      } else {
        throw new Error("Workflow result is undefined");
      }
    } catch (error) {
      console.error("Error sending event:", error);
      throw error;
    }
  };

  const sendReply = async (
    channel: string,
    ts: string,
    text: string,
  ): Promise<void> => {
    try {
      const response = await paragon.request("slack", "/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          channel,
          thread_ts: ts,
          text,
        },
      });

      console.log("Message sent successfully:", response);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
        append={append}
        sendReply={sendReply}
        channel={channel}
        ts={ts}
      />
      <ChatInput
        input={input}
        handleSubmit={(e) => {
          handleSubmit(e);
          sendMessage(input); // Send the message to Slack as well
        }}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        messages={messages}
        append={append}
        setInput={setInput}
      />
    </div>
  );
}
