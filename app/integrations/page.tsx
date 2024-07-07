"use client";
import { paragon } from "@useparagon/connect";
import Image from "next/image";
import { insertDataIntoPinecone } from '../utils/pinecone';

export default function IntegrationsPage() {

  interface ParagonWorkflowResult {
    [key: string]: unknown;
    body_key?: string | string[];
  }

  const queryGoogleDriveFiles = async (): Promise<void> => {
    try {
      const result = (await paragon.workflow(
        "a6ee9917-8a81-443e-9231-721753b304bd",
        {},
      )) as ParagonWorkflowResult;

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from paragon.workflow");
      }

      let textResponses: string[] = [];

      // Handle the text field
      if (result.text) {
        if (Array.isArray(result.text)) {
          textResponses = result.text;
        } else if (typeof result.text === "string") {
          textResponses = [result.text];
        }
      }

      // Handle the files field
      if (result.files && Array.isArray(result.files)) {
        for (const file of result.files) {
          textResponses.push(file);
        }
      }

      await insertDataIntoPinecone(textResponses);
    } catch (error) {
      console.error("Error querying Google Drive files:", error);
    }
  };

  const handleConnection = async (integration: string): Promise<void> => {
    await paragon.connect(integration, {
      onSuccess: () => {
        console.log(`Successfully connected to ${integration}`);
      },
      onError: (error: Error) => {
        console.error(`Error connecting to ${integration}:`, error);
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Integrations
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Connect your favorite tools to enhance your workflow.
        </p>
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={() => handleConnection("slack")}
            className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 w-full max-w-sm"
          >
            <Image
              src="/slack.png"
              alt="Slack"
              width={24}
              height={24}
              className="mr-3"
            />
            <span className="text-lg">Connect to Slack</span>
          </button>
          <button
            onClick={() => handleConnection("googledrive")}
            className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 w-full max-w-sm"
          >
            <Image
              src="/googledrive.png"
              alt="Google Drive"
              width={24}
              height={24}
              className="mr-3"
            />
            <span className="text-lg">Connect to Drive</span>
          </button>
          <button
            onClick={queryGoogleDriveFiles}
            className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 w-full max-w-sm"
          >
            <Image
              src="/googledrive.png"
              alt="Google Drive"
              width={24}
              height={24}
              className="mr-3"
            />
            <span className="text-lg">Ingest Files</span>
          </button>
        </div>
      </div>
    </div>
  );
}
