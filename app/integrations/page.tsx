"use client";
import { Pinecone } from "@pinecone-database/pinecone";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import Paragon SDK
const ParagonSDK = dynamic(
  () => import("@useparagon/connect").then((mod) => mod.paragon),
  {
    ssr: false,
  },
);

export default function IntegrationsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pineconeLoaded, setPineconeLoaded] = useState(false);
  const [paragonLoaded, setParagonLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeClients = async () => {
      try {
        // Initialize Pinecone without passing configuration
        const pinecone = new Pinecone();
        // Test the connection by listing indexes
        const indexes = await pinecone.listIndexes();
        console.log("Pinecone indexes:", indexes);
        setPineconeLoaded(true);

        // Authenticate Paragon (only in browser environment)
        if (typeof window !== "undefined" && ParagonSDK) {
          await ParagonSDK.authenticate(
            "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
            process.env.NEXT_PUBLIC_PARAGON_SIGNING_KEY || "",
          );
          console.log("Paragon authenticated successfully");
          setParagonLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing clients:", error);
        setError(
          `Error initializing clients: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    initializeClients();

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!pineconeLoaded || !paragonLoaded) {
        setError(
          "Initialization timed out. Please refresh the page and try again.",
        );
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, []);

  const handleConnection = async (integration: string) => {
    if (typeof window !== "undefined" && ParagonSDK) {
      try {
        await ParagonSDK.connect(integration, {
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
    }
  };

  const queryGoogleDriveFiles = async () => {
    if (typeof window !== "undefined" && ParagonSDK) {
      setIsProcessing(true);
      try {
        const result = await ParagonSDK.workflow(
          "a6ee9917-8a81-443e-9231-721753b304bd",
          {},
        );

        const textResponse = result.body_key;
        console.log("Extracted text:", textResponse);

        // Generate embeddings using OpenAI
        const embeddings = await generateEmbeddings(textResponse);

        // Send embeddings to Pinecone
        await sendEmbeddingsToPinecone(textResponse, embeddings);

        console.log("Process completed successfully");
      } catch (error) {
        console.error("Error processing Google Drive files:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const generateEmbeddings = async (text: string) => {
    try {
      const response = await fetch("/api/generate-embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate embeddings");
      }

      const data = await response.json();
      return data.embedding;
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
      const pinecone = new Pinecone();
      const index = pinecone.Index(
        process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME || "",
      );

      // Generate a unique ID for this document
      const id = `doc_${Date.now()}`;

      // Prepare the vector data
      const vectorData = {
        id,
        values: embeddings,
        metadata: {
          text: text.slice(0, 1000), // Store first 1000 characters as metadata
          timestamp: new Date().toISOString(),
        },
      };

      // Upsert the vector into Pinecone
      await index.upsert([vectorData]);

      console.log("Embeddings sent to Pinecone successfully");
    } catch (error) {
      console.error("Error sending embeddings to Pinecone:", error);
      throw error;
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!pineconeLoaded || !paragonLoaded) {
    return (
      <div>
        <p>Loading...</p>
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
      </div>
    </div>
  );
}
