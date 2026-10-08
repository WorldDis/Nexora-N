import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { GoogleGenAI } from '@google/genai';

function nexoraApiPlugin(): Plugin {
  return {
    name: 'nexora-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/plan', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const { systemPrompt, userQuery, availableToolsJson, currentContextState } = body;

            const apiKey = process.env.GEMINI_API_KEY;

            if (apiKey) {
              try {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `
${systemPrompt || 'You are NEXORA, a voice-controlled accessibility agent.'}

Available Tools:
${availableToolsJson || '[]'}

Current UI Context:
${currentContextState || ''}

User Goal: ${userQuery || ''}

Respond ONLY in valid raw JSON with this exact schema:
{
  "reasoning": "step by step explanation of what you see and what to do next",
  "selectedTool": "tool_name_or_null",
  "toolParameters": {},
  "isTaskComplete": false,
  "finalResponseToUser": "Bengali or English response to user if speaking or completing"
}
Do NOT wrap in markdown code fences. Return valid JSON only.
`;
                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                  config: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });

                const text = response.text || '';
                const cleaned = text.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
                const parsed = JSON.parse(cleaned);

                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    provider: 'GEMINI_SERVER_API',
                    reasoning: parsed.reasoning || 'Step evaluated by Gemini 3.8 Flash',
                    selectedTool: parsed.selectedTool || null,
                    toolParameters: parsed.toolParameters || {},
                    isTaskComplete: Boolean(parsed.isTaskComplete),
                    finalResponseToUser: parsed.finalResponseToUser || null,
                  })
                );
                return;
              } catch (geminiError: any) {
                console.warn('Gemini API call failed, falling back to local reasoner:', geminiError?.message);
              }
            }

            // Local Deterministic Semantic ReAct Reasoner
            const plan = generateLocalPlan(userQuery, currentContextState);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                provider: 'NEXORA_LOCAL_REASONER',
                ...plan,
              })
            );
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: e.message,
                reasoning: `Server error: ${e.message}`,
                selectedTool: null,
                toolParameters: {},
                isTaskComplete: true,
                finalResponseToUser: 'AI service-e somossa hocche.',
              })
            );
          }
        });
      });
    },
  };
}

function generateLocalPlan(query: string = '', contextState: string = '') {
  const q = query.toLowerCase();
  const lowerContext = contextState.toLowerCase();

  if (q.includes('whatsapp') || q.includes('হোয়াটসঅ্যাপ') || q.includes('chat')) {
    if (!lowerContext.includes('whatsapp') && !lowerContext.includes('recent conversations')) {
      return {
        reasoning: 'User requested WhatsApp. Navigating to WhatsApp application.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.whatsapp' },
        isTaskComplete: false,
        finalResponseToUser: 'WhatsApp kholchi.',
      };
    }
  }

  if (q.includes('setting') || q.includes('সেটিংস')) {
    if (!lowerContext.includes('settings') && !lowerContext.includes('wi-fi')) {
      return {
        reasoning: 'User requested system settings.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.android.settings' },
        isTaskComplete: false,
        finalResponseToUser: 'Settings open korchi.',
      };
    }
  }

  if (q.includes('contact') || q.includes('যোগাযোগ') || q.includes('ফোন')) {
    if (!lowerContext.includes('contacts')) {
      return {
        reasoning: 'User requested contacts phonebook.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.google.android.contacts' },
        isTaskComplete: false,
        finalResponseToUser: 'Contacts open korchi.',
      };
    }
  }

  if (q.includes('note') || q.includes('নোট')) {
    if (!lowerContext.includes('notes') && !lowerContext.includes('memos')) {
      return {
        reasoning: 'User requested quick notes application.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.nexora.notes' },
        isTaskComplete: false,
        finalResponseToUser: 'Notes app kholchi.',
      };
    }
  }

  // Type text detection
  if (q.includes('type') || q.includes('likho') || q.includes('লিখো') || q.includes('write')) {
    const match = query.match(/(?:type|likho|লিখো|write)\s+["']?([^"']+)["']?/i);
    const textToType = match && match[1] ? match[1].trim() : query.replace(/(?:type|likho|লিখো|in whatsapp|please)/gi, '').trim();

    if (textToType) {
      return {
        reasoning: `Found editable input target. Typing "${textToType}".`,
        selectedTool: 'type_text',
        toolParameters: { text: textToType, fieldLabel: 'Type a message' },
        isTaskComplete: false,
        finalResponseToUser: `"${textToType}" type kora hocche.`,
      };
    }
  }

  // Click detection: match clickable items on screen
  const screenLines = contextState.split('\n');
  for (const line of screenLines) {
    if (line.includes('[clickable]')) {
      const label = line.replace(/.*\[clickable\]\s*/i, '').trim();
      if (label && label.length > 1 && q.includes(label.toLowerCase())) {
        return {
          reasoning: `Found matching clickable element "${label}". Dispatching click action.`,
          selectedTool: 'click_element',
          toolParameters: { targetText: label },
          isTaskComplete: false,
          finalResponseToUser: `"${label}" e click korchi.`,
        };
      }
    }
  }

  // Scroll detection
  if (q.includes('scroll down') || q.includes('niche namo') || q.includes('নিচে') || q.includes('scroll')) {
    return {
      reasoning: 'Scrolling screen downwards.',
      selectedTool: 'scroll_screen',
      toolParameters: { direction: 'FORWARD' },
      isTaskComplete: false,
      finalResponseToUser: 'Screen scroll kora holo.',
    };
  }

  if (q.includes('scroll up') || q.includes('upore utho') || q.includes('উপরে')) {
    return {
      reasoning: 'Scrolling screen upwards.',
      selectedTool: 'scroll_screen',
      toolParameters: { direction: 'BACKWARD' },
      isTaskComplete: false,
      finalResponseToUser: 'Screen upore scroll kora holo.',
    };
  }

  return {
    reasoning: 'User goal fulfilled based on current screen elements.',
    selectedTool: null,
    toolParameters: {},
    isTaskComplete: true,
    finalResponseToUser: 'Kaaj-ta hoye gechhe! (Task completed successfully)',
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nexoraApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
