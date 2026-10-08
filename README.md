# NEXORA — AI Accessibility & Action Agent (React Web Port)

> **Tagline:** *"You speak. Nexora understands. Nexora acts."*

NEXORA is an autonomous, accessibility-first AI action agent rewritten as a high-performance React application. Originally designed for Android, this port preserves all original core features, business logic, safety architecture, and decoupled ReAct reasoning while providing an interactive simulated target environment.

---

## Key Features & Ported Architecture

- **Voice Engine (Speech-to-Text & Text-to-Speech):**
  - Spoken voice commands in English & Bengali ("Bolo" trigger).
  - Speech synthesis feedback matching the original `NexoraTtsManager` with Indian Bengali (`bn-IN`) and English (`en-US`) locale handling.
  - Quick action prompt presets and stop controls.
- **Semantic UI & Accessibility Tree Inspection:**
  - Real-time semantic node extraction via `UiNodeParser` mapping DOM & simulated screen nodes into `UiElement(id, text, contentDescription, className, isClickable, isEditable, bounds)`.
  - Live Accessibility Tree visualizer with click-to-inspect bounds spotlight.
- **Decoupled AI Brain & ReAct Planner:**
  - `AIProvider` interface with `generatePlan(...)` and `AIPlanResponse` models.
  - `GeminiAIProvider` leveraging server-side Gemini 3.8 Flash (`gemini-3.8-flash`) via `@google/genai` with deterministic local heuristic reasoning fallback.
  - Multi-step `ReActPlanner` executing iterative Thought-Action-Observation loops up to 8 steps.
- **Zero-Trust Safety Model & RiskGateManager:**
  - Risk tier classifications: `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
  - Gatekeeper intercepts tool execution before actuation.
  - Supports both the original Android `DenyAllConfirmation` policy and interactive user approval modal dialogs.
- **Extensible Tool Registry & System Tools:**
  - `click_element`: Dispatches click events on matched accessibility nodes.
  - `type_text`: Types text into focused or labeled inputs.
  - `scroll_screen`: Directional scrolling (`FORWARD`/`BACKWARD`).
  - `open_app`: Switches active target application packages (`com.whatsapp`, `com.android.settings`, `com.google.android.contacts`, `com.nexora.notes`, `com.android.browser`, `com.android.calculator`).
  - Elevated risk sample tools: `send_message`, `modify_system_setting`, `clear_app_data`.
- **Target Device Simulator:**
  - Interactive simulated applications: WhatsApp, Android System Settings, Contacts, Quick Notes, Browser, and Calculator.
- **Verification Engine & Test Runner:**
  - `VerificationEngine` ensuring post-action screen state validity.
  - Built-in interactive browser test runner verifying 100% of the unit test suites from `ReActPlannerTest`, `TaskStateManagerTest`, and `RiskGateManagerTest`.

---

## Project Structure

```text
├── src/
│   ├── accessibility/         # Semantic node tree parsing & DOM walkers
│   │   └── UiNodeParser.ts
│   ├── brain/                 # Decoupled AI reasoning & ReAct planning
│   │   ├── planner/           # ReActPlanner with step history tracking
│   │   └── provider/          # GeminiAIProvider & AIProvider interface
│   ├── core/                  # Core orchestrator, state machine, event bus
│   │   ├── eventbus/          # NexoraEventBus (Event-driven pub/sub)
│   │   ├── orchestrator/      # TaskOrchestrator multi-step loop
│   │   ├── state/             # TaskStateManager (IDLE -> PLANNING -> EXECUTING)
│   │   └── verification/      # VerificationEngine
│   ├── safety/                # Zero-Trust RiskGate & confirmation handlers
│   │   ├── RiskGateManager.ts
│   │   ├── DenyAllConfirmation.ts
│   │   └── InteractiveConfirmation.ts
│   ├── simulator/             # Virtual Android Device environment & context
│   │   ├── DeviceContext.ts
│   │   └── VirtualDevice.tsx
│   ├── tools/                 # ToolRegistry and system tools
│   │   ├── system/            # ClickTool, ScrollTool, TypeTextTool, OpenAppTool
│   │   └── ToolRegistry.ts
│   ├── voice/                 # VoiceEngine (STT & TTS bilingual audio)
│   ├── components/            # UI Panels (VoiceOverlay, ReActConsole, AccessibilityInspector)
│   ├── types/                 # TypeScript interfaces & enums
│   ├── App.tsx                # Main application dashboard
│   ├── main.tsx               # React DOM bootstrap
│   └── index.css              # Global styles & Tailwind
├── vite.config.ts             # Vite configuration with API middleware
├── server.ts                  # Production full-stack Express server
└── package.json               # Dependencies and scripts
```

---

## Development

```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Build production bundle
npm run build
```
