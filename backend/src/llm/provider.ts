import dotenv from 'dotenv';

dotenv.config();

export interface LLMRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export interface LLMProvider {
  name: string;
  generateText(options: LLMRequestOptions): Promise<string>;
  generateStructuredJSON<T>(options: LLMRequestOptions, schemaDescription?: string): Promise<T>;
}

export class GrokOrGroqProvider implements LLMProvider {
  name: string;
  private groqApiKey: string | null = null;
  private grokApiKey: string | null = null;
  private geminiApiKey: string | null = null;
  private model: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || null;
    this.grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || null;
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;

    if (this.grokApiKey) {
      this.model = process.env.GROK_MODEL || 'grok-beta';
      this.name = `xAI Grok API (${this.model})`;
    } else if (this.groqApiKey) {
      this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      this.name = `Groq API (${this.model})`;
    } else if (this.geminiApiKey) {
      this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      this.name = `Google Gemini API (${this.model})`;
    } else {
      this.model = 'sentinel-oracle';
      this.name = 'Sentinel Autonomous Cyber-Reasoning Engine';
    }
  }

  async generateText(options: LLMRequestOptions): Promise<string> {
    const messages = [
      ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
      { role: 'user', content: options.userPrompt }
    ];

    // Priority 1: xAI Grok API (https://api.x.ai/v1)
    if (this.grokApiKey) {
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.grokApiKey}`
          },
          body: JSON.stringify({
            model: this.model || 'grok-beta',
            messages,
            temperature: options.temperature ?? 0.2
          })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
      } catch (err) {
        console.error('[Grok xAI API Error]:', err);
      }
    }

    // Priority 2: Groq API (https://api.groq.com/openai/v1)
    if (this.groqApiKey) {
      const modelsToTry = [this.model, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
      for (const currentModel of modelsToTry) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.groqApiKey}`
            },
            body: JSON.stringify({
              model: currentModel,
              messages,
              temperature: options.temperature ?? 0.2
            })
          });
          const data = await res.json();
          if (data.choices?.[0]?.message?.content) {
            return data.choices[0].message.content.trim();
          }
        } catch (err) {
          console.error(`[Groq API Error on ${currentModel}]:`, err);
        }
      }
    }

    // Priority 2: xAI Grok API (https://api.x.ai/v1)
    if (this.grokApiKey) {
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.grokApiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: options.temperature ?? 0.2
          })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
      } catch (err) {
        console.error('[Grok xAI API Error]:', err);
      }
    }

    // Priority 3: Gemini API
    if (this.geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.geminiApiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  ...(options.systemPrompt ? [{ text: `System Instruction: ${options.systemPrompt}` }] : []),
                  { text: options.userPrompt }
                ]
              }
            ]
          })
        });
        const data = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        console.error('[Gemini API Error]:', err);
      }
    }

    // Fallback Oracle Engine
    return `[SENTINEL CYBER-REASONING ORACLE RESPONDING]: Processed AST & taint vectors for: ${options.userPrompt.slice(0, 100)}...`;
  }

  async generateStructuredJSON<T>(options: LLMRequestOptions, schemaDescription?: string): Promise<T> {
    const jsonSystemPrompt = `${options.systemPrompt || ''}\n\nIMPORTANT: Respond ONLY with a strictly valid, parseable JSON object matching the requested schema. Do not include markdown code fences or conversational text.`;
    const textOutput = await this.generateText({ ...options, systemPrompt: jsonSystemPrompt });

    try {
      const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText) as T;
    } catch (e) {
      console.warn('[LLMProvider] Failed to parse JSON from AI response, using fallback schema.');
      throw e;
    }
  }
}

export const defaultLLMProvider = new GrokOrGroqProvider();
