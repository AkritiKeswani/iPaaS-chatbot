"use client";
import { paragon } from "@useparagon/connect";
import { useEffect } from "react";

const integrations = [
  { name: "Google Drive", path: "/integrations/google-drive", icon: "📁" },
  { name: "Slack", path: "/integrations/slack", icon: "💬" },
];

export default function IntegrationsPage() {
  useEffect(() => {
    const authenticate = async () => {
      try {
        await paragon.authenticate(
          "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MTk5Njk1MzUsImV4cCI6MTcyMDA1NTkzNX0.ea-rtajxEZO3JVLgESGi9_Mio1X-ynVhgMqHzsAh_AB_2yh-kmua0K6mIoYJUUxKkRjXTuK978ucEm2fU0egM_NlwRFpKDDsKQM8nGyoLAIfNtwE58aqAjihEWl2Yzk6pr482RIK14xUM6Lism9Hprk3ULJkU3TiFnjqnUALZ6BhJOg19uZNvrXHDC5L1190puHvUBtZN32xtDFG0l_sU_lBHSpcuVIVBcTnoDQNbWQ9sP4bV0Me61_3Vgj-P0OzluNtvcFClSEtnAV4bd2MMZ97s56dKewJ_deAthBUsjMKI9ADo8bCfoUlV_ZJggcCRKKHjWGZ2b-2hSCRW0LRV7oqfNXrxfh_v_hGfCk20-DLOtX3m5fjwHpJJXJZVdPUD7dDr7NRXgcz6iEYxRBscNDP48hVbAOr_TWHyzq1koWkyZ0jV-2sNOOpYdOnJvtMwIygKc4RKv4RybW5gFcDPPB7_5jp-AOnrR29RggpncuPyhYrPzLBYmfBuvxS04REIIGHjjU2cuE6iA-YqPMzoy-PexDRApZ2A1SBcEvJYWdmrmJy2AsAzBt1rewLkrYAp57d1mNZaYrlTcFAVhzMxAioQxQovAmOh04EWJI73ibcMv5Oo7g-MolV4mVOxk4Tw8WZEeXNWG3H5ZTihkKXfdhGIdxZJk-YOeNTGhcRIaQ",
        );
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    authenticate();
  }, []);

  const handleConnection = async (integration) => {
    await paragon.connect(integration, {
      onSuccess: () => {
        console.log(`Successfully connected to ${integration}`);
      },
      onError: (error) => {
        console.error(`Error connecting to ${integration}:`, error);
      },
    });
  };

  const queryGoogleDriveFiles = async () => {
    try {
      const response = await paragon.request(
        "googledrive",
        `/files?q=${encodeURIComponent('name="test"')}`,
        {
          method: "GET",
        },
      );
      console.log("Google Drive Files:", response);
    } catch (error) {
      console.error("Error querying Google Drive files:", error);
    }
  };

  const sendMessage = async () => {
    var eventName = "Send Message";
    var eventPayload = {
      creator: "Akriti Keswani",
      summary: "Akriti needs to eat food.",
      priority: "P1",
      status: "Not Started",
    };

    // Trigger the "Task Created" App Event
    paragon.event(eventName, eventPayload);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <div className="flex flex-col space-y-4 items-start">
        <button
          onClick={() => handleConnection("slack")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-48"
        >
          Connect to Slack
        </button>
        <button
          onClick={() => handleConnection("googledrive")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-48"
        >
          Connect to Google Drive
        </button>
        <button
          onClick={queryGoogleDriveFiles}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-48"
        >
          Query Google Drive Files
        </button>
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-48"
        >
          Send Message to Slack
        </button>
      </div>
    </div>
  );
}
