import { NextRequest, NextResponse } from 'next/server';
import { insertDataIntoPinecone } from '../../utils/pinecone';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

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