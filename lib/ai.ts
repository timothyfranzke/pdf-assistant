import OpenAI from "openai";
// import { Message } from "@prisma/client";
import { db } from "./db";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Message history formatter for OpenAI
const formatMessagesForOpenAI = (messages: any[]) => {
  return messages.map((message) => ({
    role: message.role.toLowerCase(),
    content: message.content,
  }));
};

// System prompt for PDF context
const generateSystemPrompt = (pdfText: string, documentTitle: string) => {
  return `You are an AI tutor helping a student understand the following document titled "${documentTitle}". 
  
Here's the content from the document that you should reference in your responses:

${pdfText}

Important instructions:
1. Answer questions based on the document content.
2. If asked about material not in the document, politely explain that you can only discuss content from the current document.
3. You can navigate to specific pages by specifying a page number in your response like [page:3].
4. You can highlight important text by using [highlight:text to highlight:page number].
5. You can circle content by using [circle:description:page number:x,y,width,height] with coordinates as percentages of page size.
6. Always cite page numbers when referencing specific content.
7. Be helpful, educational, and supportive.
`;
};

// Create a new conversation for a document
export const createConversation = async (documentId: string, title?: string) => {
  return db.conversation.create({
    data: {
      documentId,
      title: title || `Conversation ${new Date().toLocaleString()}`,
    },
  });
};

// Save a message to the database
export const saveMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  isVoiceMessage: boolean = false,
  referencePage?: number,
  createdAnnotations?: string[]
) => {
  return db.message.create({
    data: {
      conversationId,
      role,
      content,
      isVoiceMessage,
      referencePage,
      createdAnnotations: createdAnnotations ? JSON.stringify(createdAnnotations) : null,
    },
  });
};

// Process PDF text for context
export const processPdfForContext = async (pdfText: string, pageCount: number) => {
  // Simple implementation - in production you might use embeddings and chunking
  // to handle large documents more efficiently
  
  // Truncate if necessary to fit context window
  const maxLength = 50000; // Adjust based on model's context window
  if (pdfText.length > maxLength) {
    console.warn("PDF text too long, truncating...");
    return pdfText.substring(0, maxLength) + 
      `\n\n[Note: Document was truncated due to length. Total pages: ${pageCount}]`;
  }
  
  return pdfText;
};

// Generate AI response
export const generateAIResponse = async (
  messages: any[],
  pdfContext: string,
  documentTitle: string
) => {
  const systemPrompt = generateSystemPrompt(pdfContext, documentTitle);
  
  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...formatMessagesForOpenAI(messages),
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "I'm sorry, I couldn't generate a response.",
      annotations: extractAnnotationsFromResponse(response.choices[0].message.content || ""),
      referencePage: extractPageReference(response.choices[0].message.content || ""),
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
};

// Extract annotation instructions from AI response
export const extractAnnotationsFromResponse = (responseText: string) => {
  const annotations = [];
  
  // Extract highlight annotations
  const highlightRegex = /\[highlight:(.*?):(\d+)\]/g;
  let highlightMatch;
  
  while ((highlightMatch = highlightRegex.exec(responseText)) !== null) {
    annotations.push({
      type: "highlight",
      content: highlightMatch[1],
      pageNumber: parseInt(highlightMatch[2], 10),
      // Position will be determined client-side by finding the text
    });
  }
  
  // Extract circle annotations
  const circleRegex = /\[circle:(.*?):(\d+):([\d,.]+)\]/g;
  let circleMatch;
  
  while ((circleMatch = circleRegex.exec(responseText)) !== null) {
    const [x, y, width, height] = circleMatch[3].split(",").map(Number);
    
    annotations.push({
      type: "circle",
      content: circleMatch[1],
      pageNumber: parseInt(circleMatch[2], 10),
      position: { x, y, width, height },
    });
  }
  
  return annotations;
};

// Extract page reference from AI response
export const extractPageReference = (responseText: string) => {
  const pageRegex = /\[page:(\d+)\]/;
  const match = responseText.match(pageRegex);
  
  return match ? parseInt(match[1], 10) : null;
};

// Clean AI response for display (remove annotation markup)
export const cleanResponseForDisplay = (responseText: string) => {
  return responseText
    .replace(/\[highlight:(.*?):(\d+)\]/g, "$1 (page $2)")
    .replace(/\[circle:(.*?):(\d+):([\d,.]+)\]/g, "$1 (page $2)")
    .replace(/\[page:(\d+)\]/g, "(navigating to page $1)");
};