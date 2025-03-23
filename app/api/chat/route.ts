import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFileFromLocal } from '@/lib/pdf';
import { 
  saveMessage, 
  generateAIResponse, 
  processPdfForContext,
  cleanResponseForDisplay,
  extractAnnotationsFromResponse,
  extractPageReference,
} from '@/lib/ai';
import { PDFExtract } from 'pdf.js-extract';
import path from 'path';


const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.js');

// Set the global worker path
if (typeof window === 'undefined') {
  process.env.PDFJS_WORKER_SRC = pdfWorkerPath;
}
// PDF extractor
const pdfExtract = new PDFExtract();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { 
        conversationId, 
        documentId, 
        message, 
        isVoiceMessage = false,
        pdfText = '', // Get the PDF text from the request
      } = body;
    
    if (!conversationId || !documentId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Verify user has access to the document and conversation
    const document = await db.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        documentId,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });
    
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    
    // Save user message
    const userMessage = await saveMessage(
        conversationId,
        'user',
        message,
        isVoiceMessage
      );
    
    // Get PDF text content (in a real app, you might cache this)
    // const pdfText = await extractPdfText(document.fileKey);
    const processedContext = await processPdfForContext(pdfText, document.pageCount);
    
    // Generate AI response
    const aiResponse = await generateAIResponse(
        [...conversation.messages, userMessage],
        processedContext,
        document.title
      );
    
    // Clean the response for display
    const displayContent = cleanResponseForDisplay(aiResponse.content);
    
    // Save annotations if any
    const savedAnnotations = [];
    if (aiResponse.annotations && aiResponse.annotations.length > 0) {
      for (const annotation of aiResponse.annotations) {
        const savedAnnotation = await db.annotation.create({
          data: {
            documentId,
            type: annotation.type,
            content: annotation.content,
            pageNumber: annotation.pageNumber,
            position: annotation.position,
            color: "#FFEB3B",
          },
        });
        savedAnnotations.push(savedAnnotation.id);
      }
    }
    
    // Save assistant message
    const assistantMessage = await saveMessage(
      conversationId,
      'assistant',
      displayContent,
      false,
      aiResponse.referencePage ?? undefined,
      savedAnnotations.length > 0 ? savedAnnotations : undefined
    );
    
    return NextResponse.json({
      success: true,
      message: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
        referencePage: assistantMessage.referencePage,
      },
      annotations: aiResponse.annotations,
      referencePage: aiResponse.referencePage,
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}