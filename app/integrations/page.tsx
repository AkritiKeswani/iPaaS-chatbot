"use client";
import { paragon } from "@useparagon/connect";
import { useEffect } from "react";
import { text } from "stream/consumers";
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from "openai";

export default function IntegrationsPage() {
  useEffect(() => {
    const authenticate = async () => {
      try {
        // Don't use this in production!
        paragon.authenticate(
          "5f407163-ca1d-4ae2-993a-00e2858cc6ed",
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MjAwODQ3MTIsImV4cCI6MTcyMDE3MTExMn0.Sah_RmknlvWf74IOL5oHl4f8Xi-HdDTpk9VFtqN7BgdgI1RK7Ps9cZYb5Lxum4hizbZG3KiHuGRW-g0Z7HnejHdeuWffEg-ZXMugefG-47ns58vOFVCeEWZ02d2ORXxeNH-LkjdtSynOx3erD05yBy3cL08UW-a0DhkakTpYZlHbOY9uksVt5rqQy-WpFfXGylR6lbs6bs1fUB8yn6C2tOgnHD5k4WOhAN4nEoQCoe1_HH26tDZl2KzkPxLYLAdQ4KOTU6jLPZTHQnNmk0QsIM1_WrSolZgFzBTekxX68K8goQMI6V0hHFB2eSE34nr2Lb2fusxHeg25fdvsvPkZ9wWgGAfnn7CtamuQPF-OOJkydhqXwoqmHeXKns5Y2O9T0jgMg6q_2kRDwj7lCn54TvOMyC0DOpvyR9uuyozgI_SLTB0bD6dIRBKVpm4qTSunWg3_DovjREgFG50i4AKLt7pgR2eCLugd5zAQm3F0TrjzQxOnlboIPsjv9rBo6YAaoWYlrgpWE5xPfwNEi9VAPEwlH1XG5jhomkiC5OAxmPZCpncpscYrmVcjAy0CQSsMz4xd_X_odCXaVNyc_enE2-2R8Gjnef57EK6HWbwdZLUdlDpRWq7Ryi4D5HGHhXNan1LogfPMMTaKfEX6YQl74CQnCjch99n-lK6HXVfXZ5I",
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
  const PINECONE_API_KEY='6738058c-cfe3-41f2-b351-411af67e707d'
  const PINECONE_ENVIRONMENT='us-east-1'
  const INDEX_NAME='paragon-store'
  const OPENAI_API_KEY = 'sk-proj-c54d6BiQplcm2r5YGudzT3BlbkFJo5XRM5tHNsuBJl8q2uZC'; 
  
  async function setupPinecone() {
    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pinecone.Index(INDEX_NAME);
    return index;
  }
  
  async function getEmbedding(text) {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true});
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
  
  async function insertDataIntoPinecone(textResponse) {
    const index = await setupPinecone();
  
    // Preprocess text data
    const chunks = textResponse[0].split('\r\n\r\n\r\n');
    const vectors = await Promise.all(chunks.map(async (chunk, id) => ({
      id: id.toString(),
      values: await getEmbedding(chunk),
      metadata: { text: chunk }
    })));
  
    // Insert vectors into Pinecone index
    await index.upsert(
      vectors
    );
  }
  
  const queryGoogleDriveFiles = async () => {
    const result = await paragon.workflow(
      "a6ee9917-8a81-443e-9231-721753b304bd",
      {},
    );
  
    const textResponse = result.body_key; 
    console.log(textResponse)
    await insertDataIntoPinecone(textResponse);
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
