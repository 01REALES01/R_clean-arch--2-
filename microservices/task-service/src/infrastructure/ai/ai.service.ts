import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');

        if (!apiKey) {
            console.warn('⚠️  OPENAI_API_KEY not configured. AI task generation will not be available.');
            return;
        }

        console.log(`✅ AI Service initialized with API Key (ending in ...${apiKey.slice(-4)})`);

        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async generateTask(prompt: string): Promise<any> {
        if (!this.openai) {
            console.error('❌ OpenAI instance not initialized (missing API key)');
            throw new Error('OpenAI API key not configured. AI task generation is not available.');
        }

        console.log(`🤖 Generating task for prompt: "${prompt}"`);

        try {
            const systemPrompt = `
          You are a helpful task management assistant. 
          Generate a structured task from the user's prompt.
          Return ONLY a JSON object with the following fields:
          - title: string (concise title)
          - description: string (detailed description)
          - subtasks: string[] (list of subtask titles, max 5)
          - priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          - estimatedDuration: string (e.g., '30 mins', '2 hours')
          - suggestedCategory: string (e.g., 'Work', 'Personal', 'Health')
        `;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                model: 'gpt-3.5-turbo',
                response_format: { type: 'json_object' },
            });

            const content = completion.choices[0].message.content;
            console.log('✅ AI Response received:', content);
            return JSON.parse(content || '{}');
        } catch (error) {
            console.error('❌ OpenAI API Error:', error);
            throw error;
        }
    }
}
