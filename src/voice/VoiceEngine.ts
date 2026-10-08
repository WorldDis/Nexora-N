import { NexoraEventBus } from '../core/eventbus/NexoraEventBus';
import { TaskStateManager } from '../core/state/TaskStateManager';
import { TaskState } from '../types';

export class VoiceEngine {
  private recognition: any = null;
  private isListening = false;
  private selectedLanguage: 'bn-IN' | 'en-US' = 'bn-IN';
  private synthesisVoice: SpeechSynthesisVoice | null = null;
  private listeners: ((state: { isListening: boolean; transcript: string; feedback: string }) => void)[] = [];
  private currentTranscript: string = '';
  private lastFeedback: string = '';

  constructor(private taskStateManager: TaskStateManager) {
    this.initTts();
    this.initStt();
    this.observeEvents();
  }

  private initTts(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try finding Bengali voice, else Indian English or standard English
        const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
        const enVoice = voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en-US'));
        this.synthesisVoice = bnVoice || enVoice || voices[0] || null;
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  private initStt(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.selectedLanguage;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notify();
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          this.currentTranscript = transcript;
          this.notify();

          if (event.results[0].isFinal) {
            this.handleSpokenTranscript(transcript.trim());
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.notify();
          if (event.error !== 'no-speech') {
            NexoraEventBus.emit({
              type: 'ErrorOccurred',
              message: `STT Error: ${event.error}`,
            });
            this.taskStateManager.transitionTo(TaskState.FAILED);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notify();
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization failed:', e);
      }
    }
  }

  private observeEvents(): void {
    NexoraEventBus.subscribe((event) => {
      if (event.type === 'SpeakFeedback') {
        this.lastFeedback = event.text;
        this.speak(event.text);
        this.notify();
      } else if (event.type === 'StopRequested') {
        this.stopAll();
      }
    });
  }

  setLanguage(lang: 'bn-IN' | 'en-US'): void {
    this.selectedLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  getLanguage(): 'bn-IN' | 'en-US' {
    return this.selectedLanguage;
  }

  startListening(): void {
    this.currentTranscript = '';
    this.taskStateManager.transitionTo(TaskState.LISTENING);

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Already listening or recognition issue:', e);
      }
    } else {
      this.isListening = true;
      this.notify();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.notify();
  }

  /**
   * Dispatches spoken user command into NexoraEventBus
   */
  handleSpokenTranscript(transcript: string): void {
    this.stopListening();
    this.currentTranscript = transcript;
    this.taskStateManager.transitionTo(TaskState.UNDERSTANDING);
    NexoraEventBus.emit({
      type: 'UserSpokenInput',
      transcript,
    });
    this.notify();
  }

  speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.synthesisVoice) {
        utterance.voice = this.synthesisVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  stopAll(): void {
    this.stopListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  destroy(): void {
    this.stopAll();
    this.recognition = null;
  }

  subscribe(fn: (state: { isListening: boolean; transcript: string; feedback: string }) => void): () => void {
    this.listeners.push(fn);
    fn({
      isListening: this.isListening,
      transcript: this.currentTranscript,
      feedback: this.lastFeedback,
    });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) =>
      fn({
        isListening: this.isListening,
        transcript: this.currentTranscript,
        feedback: this.lastFeedback,
      })
    );
  }
}
