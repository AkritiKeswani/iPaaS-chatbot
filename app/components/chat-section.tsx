"use client";

import { paragon } from "@useparagon/connect";
import { useChat } from "ai/react";
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
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
  });

  const handleAuthentication = async () => {
    await paragon.authenticate(
      "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MTk5Njk1MzUsImV4cCI6MTcyMDA1NTkzNX0.ea-rtajxEZO3JVLgESGi9_Mio1X-ynVhgMqHzsAh_AB_2yh-kmua0K6mIoYJUUxKkRjXTuK978ucEm2fU0egM_NlwRFpKDDsKQM8nGyoLAIfNtwE58aqAjihEWl2Yzk6pr482RIK14xUM6Lism9Hprk3ULJkU3TiFnjqnUALZ6BhJOg19uZNvrXHDC5L1190puHvUBtZN32xtDFG0l_sU_lBHSpcuVIVBcTnoDQNbWQ9sP4bV0Me61_3Vgj-P0OzluNtvcFClSEtnAV4bd2MMZ97s56dKewJ_deAthBUsjMKI9ADo8bCfoUlV_ZJggcCRKKHjWGZ2b-2hSCRW0LRV7oqfNXrxfh_v_hGfCk20-DLOtX3m5fjwHpJJXJZVdPUD7dDr7NRXgcz6iEYxRBscNDP48hVbAOr_TWHyzq1koWkyZ0jV-2sNOOpYdOnJvtMwIygKc4RKv4RybW5gFcDPPB7_5jp-AOnrR29RggpncuPyhYrPzLBYmfBuvxS04REIIGHjjU2cuE6iA-YqPMzoy-PexDRApZ2A1SBcEvJYWdmrmJy2AsAzBt1rewLkrYAp57d1mNZaYrlTcFAVhzMxAioQxQovAmOh04EWJI73ibcMv5Oo7g-MolV4mVOxk4Tw8WZEeXNWG3H5ZTihkKXfdhGIdxZJk-YOeNTGhcRIaQ",
    );

    paragon.connect("slack", {
      onSuccess: () => {
        console.log("Successfully connected to Slack");
      },
      onError: (error) => {
        console.error("Error connecting to Slack:", error);
      },
    });
  };

  const sendMessage = async (content: string) => {
    var eventName = "Send Message";
    var eventPayload = {
      creator: "User",
      summary: content,
      priority: "P1",
      status: "Not Started",
    };

    // Trigger the "Task Created" App Event
    paragon.event(eventName, eventPayload);
  };

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
        append={append}
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
        handleAuthentication={handleAuthentication}
      />
    </div>
  );
}
