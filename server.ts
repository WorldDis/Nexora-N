import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// API: ReAct Planning Endpoint
app.post('/api/plan', async (req, res) => {
  try {
    const { systemPrompt, userQuery, availableToolsJson, currentContextState } = req.body;

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

        return res.json({
          provider: 'GEMINI_SERVER_API',
          reasoning: parsed.reasoning || 'Step evaluated by Gemini 3.8 Flash',
          selectedTool: parsed.selectedTool || null,
          toolParameters: parsed.toolParameters || {},
          isTaskComplete: Boolean(parsed.isTaskComplete),
          finalResponseToUser: parsed.finalResponseToUser || null,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API request failed, using intelligent local planner fallback:', geminiError?.message);
        // Fallback to local intelligent planner
      }
    }

    // Heuristic deterministic planner fallback (mimics ReAct reasoning for accessibility agent)
    const fallbackPlan = generateLocalPlan(userQuery, currentContextState, availableToolsJson);
    return res.json({
      provider: 'NEXORA_LOCAL_REASONER',
      ...fallbackPlan,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Plan generation failed',
      reasoning: `Server error: ${err?.message}`,
      selectedTool: null,
      toolParameters: {},
      isTaskComplete: true,
      finalResponseToUser: 'AI service-e somossa hocche. Please try again.',
    });
  }
});

function generateLocalPlan(query: string = '', contextState: string = '', toolsJson: string = '') {
  const q = query.toLowerCase();
  const lowerContext = contextState.toLowerCase();

  // If opening app
  if (q.includes('whatsapp') || q.includes('হোয়াটসঅ্যাপ')) {
    if (!lowerContext.includes('whatsapp') && !lowerContext.includes('chats')) {
      return {
        reasoning: 'User wants to open WhatsApp and current screen does not show WhatsApp UI.',
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
        reasoning: 'User requested contacts application.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.google.android.contacts' },
        isTaskComplete: false,
        finalResponseToUser: 'Contacts open korchi.',
      };
    }
  }

  if (q.includes('note') || q.includes('নোট')) {
    if (!lowerContext.includes('notes')) {
      return {
        reasoning: 'User requested notes application.',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.nexora.notes' },
        isTaskComplete: false,
        finalResponseToUser: 'Notes app kholchi.',
      };
    }
  }

  // Type text detection
  if (q.includes('type') || q.includes('likho') || q.includes('লিখো') || q.includes('send') || q.includes('search') || q.includes('খোঁজ')) {
    let textToType = '';
    const match = query.match(/(?:type|likho|লিখো|search|khujo|search for|text)\s+["']?([^"']+)["']?/i);
    if (match && match[1]) {
      textToType = match[1].trim();
    } else {
      textToType = query.replace(/(?:type|likho|লিখো|search|please)/gi, '').trim();
    }

    if (textToType) {
      return {
        reasoning: `Found editable context. Typing '${textToType}' into active input field.`,
        selectedTool: 'type_text',
        toolParameters: { text: textToType, fieldLabel: 'Search' },
        isTaskComplete: false,
        finalResponseToUser: `'${textToType}' type kora hocche.`,
      };
    }
  }

  // Click detection: match clickable items on screen
  const screenLines = contextState.split('\n');
  for (const line of screenLines) {
    if (line.includes('[clickable]') || line.includes('[text]')) {
      const label = line.replace(/.*\[(clickable|text)\]\s*/i, '').trim();
      if (label && label.length > 1 && q.includes(label.toLowerCase())) {
        return {
          reasoning: `Matched screen target "${label}" with user instruction "${query}".`,
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
      reasoning: 'Instruction indicates scrolling down.',
      selectedTool: 'scroll_screen',
      toolParameters: { direction: 'FORWARD' },
      isTaskComplete: false,
      finalResponseToUser: 'Screen scroll kora holo.',
    };
  }

  if (q.includes('scroll up') || q.includes('upore utho') || q.includes('উপরে')) {
    return {
      reasoning: 'Instruction indicates scrolling up.',
      selectedTool: 'scroll_screen',
      toolParameters: { direction: 'BACKWARD' },
      isTaskComplete: false,
      finalResponseToUser: 'Screen upore scroll kora holo.',
    };
  }

  // Default completed
  return {
    reasoning: 'Task instructions fulfilled or goal reached with available UI state.',
    selectedTool: null,
    toolParameters: {},
    isTaskComplete: true,
    finalResponseToUser: 'Kaaj-ta hoye gechhe! (Task completed successfully)',
  };
}

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NEXORA server running at http://0.0.0.0:${port}`);
  });
}

startServer();
