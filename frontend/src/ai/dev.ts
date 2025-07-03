import { config } from 'dotenv';
config();

import '@/ai/flows/lesson-plan-generator.ts';
import '@/ai/flows/worksheet-generator.ts';
import '@/ai/flows/story-generator.ts';
import '@/ai/flows/voice-script-generator.ts';
import '@/ai/flows/inclusive-worksheet-generator.ts';
import '@/ai/flows/bilingual-worksheet-generator.ts';
import '@/ai/flows/concept-explainer.ts';
import '@/ai/flows/auto-grader.ts';
import '@/ai/flows/multilingual-translation.ts';
import '@/ai/flows/experiment-instructions-generator.ts';
import '@/ai/flows/visual-aid-generator.ts';
import '@/ai/flows/conversational-assistant.ts';
import '@/ai/flows/email-composer.ts';
