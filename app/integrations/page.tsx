"use client";
import { Pinecone } from "@pinecone-database/pinecone";
import { paragon } from "@useparagon/connect";
import OpenAI from "openai";
import { useEffect, useState } from "react";

export default function IntegrationsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [openAILoaded, setOpenAILoaded] = useState(false);
  const [pineconeLoaded, setPineconeLoaded] = useState(false);
  const [paragonLoaded, setParagonLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeClients = async () => {
      try {
        console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
        console.log(
          "NEXT_PUBLIC_PINECONE_API_KEY:",
          process.env.NEXT_PUBLIC_PINECONE_API_KEY,
        );
        console.log(
          "NEXT_PUBLIC_PINECONE_ENVIRONMENT:",
          process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT,
        );
        console.log(
          "NEXT_PUBLIC_PARAGON_SIGNING_KEY:",
          process.env.NEXT_PUBLIC_PARAGON_SIGNING_KEY,
        );

        if (!process.env.OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is not defined");
        }
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log("OpenAI client initialized successfully");
        setOpenAILoaded(true);

        if (
          !process.env.NEXT_PUBLIC_PINECONE_API_KEY ||
          !process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT
        ) {
          throw new Error("Pinecone API key or environment is not defined");
        }
        const pinecone = new Pinecone({
          apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
          environment: process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT,
        });
        console.log("Pinecone client initialized successfully");
        setPineconeLoaded(true);

        if (!process.env.NEXT_PUBLIC_PARAGON_SIGNING_KEY) {
          throw new Error("NEXT_PUBLIC_PARAGON_SIGNING_KEY is not defined");
        }
        await paragon.authenticate(
          "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
          process.env.NEXT_PUBLIC_PARAGON_SIGNING_KEY,
        );
        console.log("Paragon authenticated successfully");
        setParagonLoaded(true);
      } catch (error) {
        console.error("Error initializing clients:", error);
        setError(
          `Error initializing clients: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    initializeClients();

    const timeoutId = setTimeout(() => {
      if (!openAILoaded || !pineconeLoaded || !paragonLoaded) {
        setError(
          "Initialization timed out. Please refresh the page and try again.",
        );
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleConnection = async (integration: string) => {
    try {
      await paragon.connect(integration, {
        onSuccess: () => {
          console.log(`Successfully connected to ${integration}`);
        },
        onError: (error) => {
          console.error(`Error connecting to ${integration}:`, error);
        },
      });
    } catch (error) {
      console.error(`Error in handleConnection for ${integration}:`, error);
    }
  };

  const queryGoogleDriveFiles = async () => {
    setIsProcessing(true);
    try {
      const result = await paragon.workflow(
        "a6ee9917-8a81-443e-9231-721753b304bd",
        {},
      );

      const textResponse = result.body_key;
      console.log("Extracted text:", textResponse);

      const embeddings = await generateEmbeddings(textResponse);

      await sendEmbeddingsToPinecone(textResponse, embeddings);

      console.log("Process completed successfully");
    } catch (error) {
      console.error("Error processing Google Drive files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateEmbeddings = async (text: string) => {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  };

  const sendEmbeddingsToPinecone = async (
    text: string,
    embeddings: number[],
  ) => {
    try {
      const index = pinecone.Index(
        process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME || "",
      );

      const id = `doc_${Date.now()}`;

      const vectorData = {
        id,
        values: embeddings,
        metadata: {
          text: text.slice(0, 1000),
          timestamp: new Date().toISOString(),
        },
      };

      await index.upsert([vectorData]);

      console.log("Embeddings sent to Pinecone successfully");
    } catch (error) {
      console.error("Error sending embeddings to Pinecone:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    const eventName = "Send Message";
    const eventPayload = {
      creator: "Akriti Keswani",
      summary: "Akriti needs to eat food.",
      priority: "P1",
      status: "Not Started",
    };

    try {
      await paragon.event(eventName, eventPayload);
    } catch (error) {
      console.error("Error sending message to Slack:", error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!openAILoaded || !pineconeLoaded || !paragonLoaded) {
    return (
      <div>
        <p>Loading...</p>
        <p>OpenAI: {openAILoaded ? "Loaded" : "Loading"}</p>
        <p>Pinecone: {pineconeLoaded ? "Loaded" : "Loading"}</p>
        <p>Paragon: {paragonLoaded ? "Loaded" : "Loading"}</p>
      </div>
    );
  }

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
          disabled={isProcessing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-48"
        >
          {isProcessing ? "Processing..." : "Query Google Drive Files"}
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
