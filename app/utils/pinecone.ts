import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const PINECONE_API_KEY = '6738058c-cfe3-41f2-b351-411af67e707d';
const INDEX_NAME = 'paragon-store';
const OPENAI_API_KEY = 'sk-proj-c54d6BiQplcm2r5YGudzT3BlbkFJo5XRM5tHNsuBJl8q2uZC';

export async function setupPinecone(): Promise<Pinecone> {
  return new Pinecone({ 
    apiKey: PINECONE_API_KEY,
  });
}

export async function getEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function insertDataIntoPinecone(textResponses: string[]): Promise<void> {
  const pinecone = await setupPinecone();
  const index = pinecone.Index(INDEX_NAME);

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