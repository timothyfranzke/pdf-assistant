/**
 * Speech recognition and synthesis utilities
 * Uses browser's Web Speech API
 */

// Types for speech recognition (not fully provided by TypeScript)
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }
  
  /**
   * Check if speech recognition is supported in the current browser
   */
  export const isSpeechRecognitionSupported = (): boolean => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  /**
   * Check if speech synthesis is supported in the current browser
   */
  export const isSpeechSynthesisSupported = (): boolean => {
    return 'speechSynthesis' in window;
  };
  
  /**
   * Create a speech recognition instance
   */
  export const createSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition is not supported in this browser');
    }
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure the recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default to English
    
    return recognition;
  };
  
  /**
   * Request microphone permission
   * Returns a promise that resolves to true if permission is granted
   */
  export const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };
  
  /**
   * Clean text before speech synthesis
   * Removes markdown formatting and other special characters
   */
  export const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/\`(.*?)\`/g, '$1')    // Remove code formatting
      .replace(/\n\n/g, '. ')          // Replace double newlines with pause
      .replace(/\n/g, ' ')             // Replace single newlines with space
      .replace(/\s+/g, ' ')            // Collapse multiple spaces
      .trim();
  };
  
  /**
   * Speak text using the browser's speech synthesis API
   */
  export const speakText = (text: string, options: {
    rate?: number;       // 0.1 to 10
    pitch?: number;      // 0 to 2
    volume?: number;     // 0 to 1
    voice?: SpeechSynthesisVoice;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  } = {}): void => {
    if (!isSpeechSynthesisSupported()) {
      console.error('Speech synthesis is not supported in this browser');
      options.onError?.('Speech synthesis not supported');
      return;
    }
  
    // Clean the text
    const cleanText = cleanTextForSpeech(text);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure utterance
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    // Set event handlers
    utterance.onstart = options.onStart ?? (() => {});
    utterance.onend = options.onEnd ?? (() => {});
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      options.onError?.(event);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };
  
  /**
   * Stop any ongoing speech synthesis
   */
  export const stopSpeaking = (): void => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  };
  
  /**
   * Get available voice options for speech synthesis
   */
  export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (!isSpeechSynthesisSupported()) {
        resolve([]);
        return;
      }
      
      // Some browsers need a timeout to properly get voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      // If no voices are available immediately, wait for the voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    });
  };
  
  /**
   * Get a specific voice by name or language
   */
  export const getVoiceByNameOrLang = async (
    nameOrLang: string
  ): Promise<SpeechSynthesisVoice | null> => {
    const voices = await getAvailableVoices();
    
    return (
      voices.find((voice) => 
        voice.name.toLowerCase().includes(nameOrLang.toLowerCase()) ||
        voice.lang.toLowerCase().includes(nameOrLang.toLowerCase())
      ) || null
    );
  };