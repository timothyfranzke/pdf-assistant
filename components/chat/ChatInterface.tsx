'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceControls from './VoiceControls';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoiceMessage?: boolean;
  referencePage?: number;
}

interface ChatInterfaceProps {
  conversationId: string;
  documentId: string;
  initialMessages?: Message[];
  onNewAnnotations?: (annotations: any[]) => void;
  onPageReference?: (page: number) => void;
  pdfText?: string; // Add this prop
}

export default function ChatInterface({
  conversationId,
  documentId,
  initialMessages = [],
  onNewAnnotations,
  onPageReference,
  pdfText = '', // Default to empty string
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() && !isRecording) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: newMessage,
      timestamp: new Date(),
      isVoiceMessage: isRecording,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Send message to API along with pdfText
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          documentId,
          message: userMessage.content,
          isVoiceMessage: isRecording,
          pdfText, // Include the PDF text in the request
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Add AI response to chat
      setMessages((prev) => [...prev, data.message]);
      
      // Handle annotations if provided
      if (data.annotations && data.annotations.length > 0 && onNewAnnotations) {
        onNewAnnotations(data.annotations);
      }
      
      // Handle page reference if provided
      if (data.referencePage && onPageReference) {
        onPageReference(data.referencePage);
      }
      
      // Read response aloud if in voice mode
      if (isVoiceMode && !isSpeaking) {
        speakText(data.message.content);
      }
      
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRecording(false);
    }
  };
  
  // Text-to-speech function
  const speakText = (text: string) => {
    import('@/lib/speech').then(({ speakText: speak, isSpeechSynthesisSupported }) => {
      if (isSpeechSynthesisSupported()) {
        speak(text, {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: (error) => {
            console.error('Speech synthesis error:', error);
            setIsSpeaking(false);
          }
        });
      }
    });
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    import('@/lib/speech').then(({ stopSpeaking: stop }) => {
      stop();
      setIsSpeaking(false);
    });
  };
  
  // Handle audio transcript from voice input
  const handleVoiceTranscript = (transcript: string) => {
    setNewMessage(transcript);
    if (transcript.trim()) {
      // Auto-submit when recording ends with content
      handleSubmit();
    }
  };
  
  // Handle voice mode toggle
  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isSpeaking) {
      stopSpeaking();
    }
  };
  
  // Start/stop recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  // Handle textarea resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };
  
  // Handle enter key (submit on Enter, new line on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">Ask questions about the document or request explanations</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onSpeakMessage={isVoiceMode ? speakText : undefined}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg animate-pulse">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-gray-600">AI is thinking...</span>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="text-sm font-medium">Error: {error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-xs text-red-600 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Voice controls */}
      {isVoiceMode && (
        <VoiceControls
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          onRecordingToggle={toggleRecording}
          onStopSpeaking={stopSpeaking}
          onTranscript={handleVoiceTranscript}
        />
      )}
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the document..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px]"
              rows={1}
              disabled={isLoading || isRecording}
            />
            
            <button
              type="button"
              onClick={toggleVoiceMode}
              className={`absolute right-2 bottom-2 p-1 rounded-full ${
                isVoiceMode ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={isVoiceMode ? 'Disable voice mode' : 'Enable voice mode'}
            >
              {isVoiceMode ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || (!newMessage.trim() && !isRecording)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}