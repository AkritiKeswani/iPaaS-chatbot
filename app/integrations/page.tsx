"use client";
import { Pinecone } from "@pinecone-database/pinecone";
import { paragon } from "@useparagon/connect";
import OpenAI from "openai";
import { useEffect } from "react";
import { FaGoogleDrive, FaSlack } from "react-icons/fa";

const PINECONE_API_KEY = "6738058c-cfe3-41f2-b351-411af67e707d";
const PINECONE_ENVIRONMENT = "us-east-1";
const INDEX_NAME = "paragon-store";
const OPENAI_API_KEY =
  "sk-proj-c54d6BiQplcm2r5YGudzT3BlbkFJo5XRM5tHNsuBJl8q2uZC";

async function setupPinecone(): Promise<Pinecone.Index> {
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
  return pinecone.Index(INDEX_NAME);
}

async function getEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function insertDataIntoPinecone(textResponses: string[]): Promise<void> {
  const index = await setupPinecone();

  let allVectors: any[] = [];

  for (let i = 0; i < textResponses.length; i++) {
    const textResponse = textResponses[i];

    const chunks = textResponse.split("\r\n\r\n\r\n");
    const vectors = await Promise.all(
      chunks.map(async (chunk, chunkId) => ({
        id: `${i}-${chunkId}`,
        values: await getEmbedding(chunk),
        metadata: { text: chunk, docIndex: i },
      })),
    );

    allVectors = allVectors.concat(vectors);
  }

  await index.upsert(allVectors);
}

export default function IntegrationsPage() {
  useEffect(() => {
    const authenticate = async () => {
      try {
        // Don't use this in production!
        paragon.authenticate(
          "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MjAxNzIzNjUsImV4cCI6MTcyMDI1ODc2NX0.ZoJXzvIVkcbKE_nlVJt7nUS0t8Lue8MemrnT48_Tt3PvVBcmC3c7I5U4k80o6Z8K-9AMo03ty_kXukr6cyKh_L6ICU6yRd33BR_tG1T_EQoqOQsIY7CDqeNWncFbIfNkkU6akjVvmFOFiFMZJ385W6eUGyNlkqRLwPDz1wT9LfIVAc2m74drnjWEKmbFgmp5JJmYZXW2k2PC0g6ISBV8EEusCVnGEHMOrufhvTNVCOwbyLStUcQsD-M8_i7yt7eWQNifOmEPXZQUfDL69fnWSbCEwTawnsi7_slcwk9np3loaJJ86QduWL5PHGBBGnijwWKM-6sr0syba7HEGAPVWdnOXJp40QMnuj-38PdyPpHtfky2MeoRT2teRkYkxHQC8zCZhpUlDmm3sbl1mM9Pc-7XQZb0A6LmyoLXYzlBzFuAoWvCNTEFVfGdDbuaT0rPqci6uuFdVsj07J5N3k3JP08SG4-Q_uPVdEig5GYKEKWy4LhxonIXu1aXpaIooQWcWBcxhUrg5C_Vh3W2UTZTulETwxAdww5Bj9AiOf76bzx0C9g0-Dkzcr0IBrHcnQ70QOsAVyQFs04giTAr63EckxPBKiXkhZBwtLaKOKR3A1gkkrlZWyrf61tQU9O9Cbas3o4DFmSPBfnXeziBjHhReIQJiUbuZAoLD1XM7wzWllc",
        );
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    authenticate();
  }, []);

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

      console.log("Text responses:", textResponses);

      if (textResponses.length === 0) {
        throw new Error(
          "No text or compatible file data found in the response",
        );
      }

      await insertDataIntoPinecone(textResponses);
    } catch (error) {
      console.error("Error querying Google Drive files:", error);
    }
  };

  const sendMessage = async (): Promise<void> => {
    const eventName = "Send Message";
    const eventPayload = {
      creator: "Akriti Keswani",
      summary: "Akriti needs to eat food.",
      priority: "P1",
      status: "Not Started",
    };

    paragon.event(eventName, eventPayload);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center font-roboto">
          Integrations
        </h1>
        <div className="flex flex-col items-center space-y-4 py-2">
          <button
            onClick={() => handleConnection("slack")}
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 w-48"
          >
            <FaSlack className="mr-2" /> Connect to Slack
          </button>
          <button
            onClick={() => handleConnection("googledrive")}
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 w-48"
          >
            <FaGoogleDrive className="mr-2" /> Connect to Google Drive
          </button>
          <button
            onClick={queryGoogleDriveFiles}
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 w-48"
          >
            <FaGoogleDrive className="mr-2" /> Choose Files to Ingest
          </button>
          {/* <button
            onClick={sendMessage}
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 w-48"
          >
            <FaSlack className="mr-2" /> Send Message to Slack
          </button> */}
        </div>
      </div>
    </div>
  );
}
