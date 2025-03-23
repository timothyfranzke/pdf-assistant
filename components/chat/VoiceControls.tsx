'use client';

import { useEffect, useState, useRef } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { 
  isSpeechRecognitionSupported, 
  createSpeechRecognition, 
  requestMicrophonePermission 
} from '@/lib/speech';

interface VoiceControlsProps {
  isRecording: boolean;
  isSpeaking: boolean;
  onRecordingToggle: () => void;
  onStopSpeaking: () => void;
  onTranscript: (transcript: string) => void;
}

export default function VoiceControls({
  isRecording,
  isSpeaking,
  onRecordingToggle,
  onStopSpeaking,
  onTranscript,
}: VoiceControlsProps) {
  const [transcript, setTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    if (!isSpeechRecognitionSupported()) {
      setRecognitionSupported(false);
      return;
    }
    
    try {
      // Create speech recognition instance
      recognitionRef.current = createSpeechRecognition();
      
      // Handle recognition results
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      // Handle recognition end
      recognitionRef.current.onend = () => {
        if (isRecording) {
          onRecordingToggle();
          if (transcript) {
            onTranscript(transcript);
          }
        }
      };
      
      // Check for microphone permission
      requestMicrophonePermission().then(granted => {
        setMicPermission(granted);
      });
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setRecognitionSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors if recognition wasn't running
        }
      }
    };
  }, []);
  
  // Start/stop recording when isRecording changes
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      try {
        recognitionRef.current.start();
        setTranscript('');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors if recognition wasn't running
      }
    }
  }, [isRecording]);
  
  if (!recognitionSupported) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-2 text-sm border-t border-yellow-200">
        Speech recognition is not supported in your browser.
      </div>
    );
  }
  
  if (micPermission === false) {
    return (
      <div className="bg-red-100 text-red-700 p-2 text-sm border-t border-red-200">
        Microphone access is blocked. Please allow microphone access to use voice features.
      </div>
    );
  }
  
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onRecordingToggle}
            className={`p-2 rounded-full ${
              isRecording
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={onStopSpeaking}
            disabled={!isSpeaking}
            className={`p-2 rounded-full ${
              isSpeaking
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200'
            }`}
            aria-label="Stop speaking"
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {isRecording ? 'Recording...' : isSpeaking ? 'Speaking...' : 'Voice mode active'}
        </div>
      </div>
      
      {isRecording && transcript && (
        <div className="mt-2 p-2 bg-white rounded-md border border-gray-200">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
}