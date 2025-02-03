import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    system: 'You are a helpful health assistant. Provide accurate, evidence-based health information while noting that you are not a replacement for professional medical advice. Always encourage users to consult healthcare professionals for specific medical concerns.',
    messages,
  });

  return result.toDataStreamResponse();
}