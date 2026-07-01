import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentService } from '../content/content.service';
import {
  CommerceCategory,
  CommerceType,
} from '@republish/shared';
import { GENERATE_DRAFT_SYSTEM } from '@republish/ai-prompts';

interface GenerateDraftInput {
  prompt: string;
  mediaUrls?: string[];
  price?: number;
  category?: string;
}

@Injectable()
export class AiService {
  constructor(
    private config: ConfigService,
    private contentService: ContentService,
  ) {}

  async generateDraft(userId: string, input: GenerateDraftInput) {
    const generated = await this.buildFromPrompt(input);
    return this.contentService.createDraft(
      userId,
      input.prompt,
      input.mediaUrls || [],
      generated,
    );
  }

  private async buildFromPrompt(input: GenerateDraftInput) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        return await this.callOpenAI(input, apiKey);
      } catch {
        // fall through to mock
      }
    }
    return this.mockGenerate(input);
  }

  private async callOpenAI(input: GenerateDraftInput, apiKey: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: GENERATE_DRAFT_SYSTEM,
          },
          { role: 'user', content: input.prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return this.mockGenerate(input);
    const parsed = JSON.parse(content) as {
      caption: string;
      hashtags: string[];
      commerce: Record<string, unknown>;
    };
    if (input.price !== undefined) parsed.commerce.price = input.price;
    return parsed;
  }

  private mockGenerate(input: GenerateDraftInput) {
    const lower = input.prompt.toLowerCase();
    let category = input.category || CommerceCategory.OTHER;
    let commerceType = CommerceType.SALE;

    if (lower.includes('promo') || lower.includes('pizza') || lower.includes('comida')) {
      category = CommerceCategory.FOOD;
      commerceType = CommerceType.PROMO;
    } else if (lower.includes('servicio') || lower.includes('service')) {
      category = CommerceCategory.OTHER;
      commerceType = CommerceType.SERVICE;
    } else if (lower.includes('iphone') || lower.includes('laptop') || lower.includes('macbook')) {
      category = CommerceCategory.ELECTRONICS;
    } else if (lower.includes('auto') || lower.includes('vehiculo')) {
      category = CommerceCategory.VEHICLE;
    }

    const priceMatch =
      input.prompt.match(/(?:precio|price|valor|\$)\s*:?\s*(\d{3,}(?:[.,]\d+)?)/i) ??
      input.prompt.match(/\$\s*(\d+(?:[.,]\d+)?)/);
    const price = input.price ?? (priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0);
    const currency =
      /clp|peso/i.test(input.prompt) ? 'CLP' : /eur/i.test(input.prompt) ? 'EUR' : 'USD';

    const caption = input.prompt.length > 200
      ? input.prompt.slice(0, 197) + '...'
      : input.prompt;

    const hashtags = ['#venta', '#publish', `#${category}`];

    return {
      caption,
      hashtags,
      commerce: {
        commerceType,
        category,
        price,
        currency,
        metadata: {},
      },
    };
  }
}
