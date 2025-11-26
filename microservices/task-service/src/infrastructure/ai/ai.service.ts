import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');

        if (!apiKey) {
            console.warn('⚠️  OPENAI_API_KEY not configured. AI features will not be available.');
            return;
        }

        console.log(`✅ AI Service initialized with OpenAI`);
        console.log(`   API Key: ...${apiKey.slice(-4)}`);

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
Eres un asistente de gestión de tareas útil. Genera una tarea estructurada a partir del mensaje del usuario.

CONTEXTO IMPORTANTE:
- Estamos en el año 2025
- Fecha actual: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
- Si el usuario no especifica un año, asume que es 2025
- TODAS las respuestas deben estar en ESPAÑOL

DIRECTRICES IMPORTANTES:
1. Escribe las descripciones en PRIMERA PERSONA (usa "Necesito...", "Debo...", "Voy a...")
2. Genera subtareas ÚNICAS y NO REDUNDANTES (cada subtarea debe ser distinta)
3. **CRÍTICO - FECHAS Y HORAS**: 
   - Si el usuario menciona una fecha específica (ej: "2 de diciembre", "diciembre 2"), usa EXACTAMENTE esa fecha
   - Si el usuario menciona una hora específica (ej: "3pm", "15:00"), usa EXACTAMENTE esa hora
   - NO inventes fechas u horas diferentes a las que el usuario especificó
   - Si el usuario dice "examen el 2 de diciembre a las 3pm", la fecha debe ser "2025-12-02T15:00:00"
   - Si no se especifica hora, usa una hora razonable según el tipo de tarea
4. Si no se especifica año, usa 2025 como predeterminado
5. Sugiere una categoría apropiada de las siguientes: Trabajo, Personal, Salud, Compras, Estudio, Universidad, Finanzas, Hogar, Social
6. Sé específico y orientado a la acción

Devuelve SOLO un objeto JSON con estos campos:
{
  "title": "string (título conciso y accionable en español)",
  "description": "string (descripción detallada en PRIMERA PERSONA y en español)",
  "subtasks": ["array de 3-5 títulos de subtareas ÚNICAS en español"],
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "dueDate": "string de fecha-hora ISO 8601 (ej: '2025-12-01T14:00:00')",
  "suggestedCategory": "string (una de: Trabajo, Personal, Salud, Compras, Estudio, Universidad, Finanzas, Hogar, Social)"
}

Ejemplo para "Preparar presentación para reunión del lunes":
{
  "title": "Preparar Presentación de Resultados Q4",
  "description": "Necesito crear una presentación completa que cubra los resultados de ventas del Q4, métricas clave y proyecciones para el próximo trimestre para la reunión del equipo del lunes.",
  "subtasks": [
    "Recopilar datos y métricas de ventas del Q4",
    "Crear estructura de diapositivas",
    "Diseñar gráficos y visualizaciones",
    "Preparar puntos clave y notas",
    "Revisar y practicar la presentación"
  ],
  "priority": "HIGH",
  "dueDate": "2025-12-02T09:00:00",
  "suggestedCategory": "Trabajo"
}

Ejemplo para "Estudiar para examen de cálculo":
{
  "title": "Estudiar para Examen de Cálculo",
  "description": "Debo repasar todos los temas de cálculo diferencial e integral para el examen de la próxima semana, enfocándome en derivadas, integrales y aplicaciones.",
  "subtasks": [
    "Revisar apuntes de clase",
    "Resolver ejercicios del libro",
    "Practicar problemas de exámenes anteriores",
    "Repasar fórmulas y teoremas clave",
    "Hacer resumen de conceptos importantes"
  ],
  "priority": "HIGH",
  "dueDate": "2025-12-05T18:00:00",
  "suggestedCategory": "Universidad"
}

RECUERDA: Todo debe estar en ESPAÑOL y usar 2025 como año predeterminado.
`;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                model: 'gpt-4o-mini',
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

    async chat(message: string, userId: string): Promise<any> {
        if (!this.openai) {
            console.error('❌ OpenAI instance not initialized (missing API key)');
            throw new Error('OpenAI API key not configured. AI chat is not available.');
        }

        console.log(`💬 Chat request from user ${userId}: "${message}"`);

        try {
            // Get user's tasks for context
            const tasks = await this.prisma.task.findMany({
                where: { userId },
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                take: 20, // Limit to recent tasks to save tokens
            });

            const taskContext = tasks.length > 0
                ? `\n\nUser's recent tasks:\n${tasks.map(t => `- ${t.title} (${t.status}, Priority: ${t.priority})`).join('\n')}`
                : '';

            const systemPrompt = `
You are a helpful productivity and task management assistant.
You help users plan their work, prioritize tasks, and improve productivity.

Guidelines:
- Be concise and actionable
- Provide specific, practical advice
- Use first person when suggesting actions ("You should...", "I recommend...")
- Focus on productivity and task management
- If asked about specific tasks, reference the user's task list${taskContext}

Keep responses brief (2-3 sentences max) unless asked for detailed plans.
`;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                model: 'gpt-4o-mini',
                max_tokens: 300, // Keep responses concise
            });

            const response = completion.choices[0].message.content;
            console.log('✅ Chat response generated');

            return {
                message: response,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('❌ OpenAI Chat Error:', error);
            throw error;
        }
    }
}
