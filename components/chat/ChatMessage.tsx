'use client';

import { useState } from 'react';
import { User, Bot, Volume2, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoiceMessage?: boolean;
  referencePage?: number;
}

interface ChatMessageProps {
  message: Message;
  onSpeakMessage?: (text: string) => void;
}

export default function ChatMessage({ message, onSpeakMessage }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleSpeakClick = () => {
    if (onSpeakMessage) {
      onSpeakMessage(message.content);
    }
  };
  
  return (
    <div
      className={`flex space-x-3 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      )}
      
      <div
        className={`relative max-w-3xl rounded-lg px-4 py-2 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium">
            {message.role === 'user' ? 'You' : 'AI Tutor'}
          </span>
          
          {message.isVoiceMessage && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-opacity-20 bg-black">
              Voice
            </span>
          )}
          
          {message.referencePage && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-opacity-20 bg-black">
              Page {message.referencePage}
            </span>
          )}
          
          <span className="text-xs flex items-center opacity-70">
            <Clock className="h-3 w-3 mr-1" />
            {formattedTime}
          </span>
        </div>
        
        <div className={`prose prose-sm ${message.role === 'user' ? 'prose-invert' : ''} max-w-none`}>
          {isExpanded ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <p>{message.content.substring(0, 150)}...</p>
          )}
          
          {message.content.length > 300 && (
            <button
              onClick={toggleExpand}
              className="text-xs underline mt-1 focus:outline-none"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        
        {message.role === 'assistant' && onSpeakMessage && (
          <button
            onClick={handleSpeakClick}
            className="absolute -right-10 top-2 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            aria-label="Speak message"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {message.role === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}