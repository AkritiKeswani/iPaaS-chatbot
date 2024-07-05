import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const PINECONE_API_KEY = '6738058c-cfe3-41f2-b351-411af67e707d';
const PINECONE_ENVIRONMENT = 'us-east-1';
const INDEX_NAME = 'paragon-store';
const OPENAI_API_KEY = 'sk-proj-c54d6BiQplcm2r5YGudzT3BlbkFJo5XRM5tHNsuBJl8q2uZC';

async function setupPinecone(): Promise<Pinecone.Index> {
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
  return pinecone.Index(INDEX_NAME);
}

async function getEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function insertDataIntoPinecone(textResponses: string[]): Promise<void> {
  const index = await setupPinecone();

  let allVectors: any[] = [];

  for (let i = 0; i < textResponses.length; i++) {
    const textResponse = textResponses[i];
    
    const chunks = textResponse.split('\r\n\r\n\r\n');
    const vectors = await Promise.all(chunks.map(async (chunk, chunkId) => ({
      id: `${i}-${chunkId}`,
      values: await getEmbedding(chunk),
      metadata: { text: chunk, docIndex: i }
    })));

    allVectors = allVectors.concat(vectors);
  }

  await index.upsert(allVectors);
}

export async function POST(req: NextRequest) {
  console.log('Received webhook request:', req)
  try {
    const data = await req.json();
    console.log('Received webhook data:', data);

    let textResponses: string[] = [];

    // Handle the text field
    if (data.text) {
      if (Array.isArray(data.text)) {
        textResponses = data.text;
      } else if (typeof data.text === 'string') {
        textResponses = [data.text];
      }
    }

    // Handle the files field
    if (data.files) {
      textResponses = textResponses.concat(data.files);
    }

    if (textResponses.length === 0) {
      console.error('No valid text or file data found');
      return NextResponse.json({ error: 'No valid text or file data found' }, { status: 400 });
    }

    // Process the messages and insert into Pinecone
    await insertDataIntoPinecone(textResponses);

    return NextResponse.json({ message: 'Webhook received and data added to Pinecone successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}