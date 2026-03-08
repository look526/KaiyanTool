import { aiProviderService } from './provider.service';

export async function callAI(
  model: string,
  messages: { role: 'user' | 'system' | 'assistant'; content: string }[],
  temperature?: string
): Promise<{ content: string }> {
  return aiProviderService.chat(model, messages, temperature);
}

export async function callAIWithPrompt(
  systemPrompt: string,
  userPrompt: string,
  temperature?: string
): Promise<{ content: string }> {
  return aiProviderService.chat(
    'default',
    [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ],
    temperature
  );
}
