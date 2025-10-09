import Anthropic from '@anthropic-ai/sdk';

export const isAnthropicAvailable = !!process.env.ANTHROPIC_API_KEY;

if (!isAnthropicAvailable) {
  console.warn('⚠️ ANTHROPIC_API_KEY not set. Claude models will not be available. Falling back to OpenAI.');
}

export const anthropic = isAnthropicAvailable ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
}) : null;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function createClaudeCompletion(
  systemPrompt: string,
  messages: ClaudeMessage[],
  model: string = 'claude-3-5-sonnet-20241022',
  maxTokens: number = 4096
): Promise<{ content: string; usage: { input_tokens: number; output_tokens: number } }> {
  if (!anthropic || !isAnthropicAvailable) {
    throw new Error('Anthropic API is not available. Please set ANTHROPIC_API_KEY environment variable.');
  }

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    });

    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return {
      content,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    };
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    throw new Error(`Claude API failed: ${error.message}`);
  }
}

export function isClaudeModel(model: string): boolean {
  return model.startsWith('claude-');
}
