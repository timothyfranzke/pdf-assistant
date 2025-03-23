'use client';

import SplitScreen from '@/components/layout/SplitScreen';
import PDFViewer from '@/components/pdf/DynamicPdfViewer';
import ChatInterface from '@/components/chat/ChatInterface';
import { useState } from 'react';

interface StudyClientProps {
  pdfUrl: string;
  documentId: string;
  annotations: any[];
  conversationId: string;
  initialMessages: any[];
  initialLeftWidth?: number;
}



export default function StudyClient({
  pdfUrl,
  documentId,
  annotations,
  conversationId,
  initialMessages,
  initialLeftWidth = 60,
}: StudyClientProps) {
    const [pdfText, setPdfText] = useState('');

const handlePdfTextExtracted = (text: string) => {
    setPdfText(text);
  };
  return (
    <div className="h-[calc(100vh-64px)]">
      <SplitScreen
        left={<PDFViewer pdfUrl={pdfUrl} annotations={annotations} documentId={documentId} onTextExtracted={handlePdfTextExtracted}/>}
        right={
          <ChatInterface
            conversationId={conversationId}
            documentId={documentId}
            initialMessages={initialMessages}
            pdfText={pdfText}
          />
        }
        initialLeftWidth={initialLeftWidth}
      />
    </div>
  );
}