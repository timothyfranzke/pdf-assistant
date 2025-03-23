// lib/vectorStore.ts
import { OpenAIEmbeddings } from '@langchain/openai';
import { db } from './db';
import { Document } from 'langchain/document';

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Split text into chunks
export const splitTextIntoChunks = (text: string, pageNumber: number, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let i = 0;
  let chunkNumber = 0;

  while (i < text.length) {
    // Find a good breakpoint (preferably at the end of a sentence or paragraph)
    let endIndex = Math.min(i + chunkSize, text.length);
    if (endIndex < text.length) {
      // Try to find a sentence break
      const possibleBreak = text.lastIndexOf('.', endIndex);
      if (possibleBreak > i + chunkSize - 200) {
        endIndex = possibleBreak + 1;
      }
    }

    chunks.push({
      content: text.slice(i, endIndex),
      pageNumber,
      chunkNumber,
    });

    // Move to next chunk with overlap
    i = endIndex - overlap;
    chunkNumber++;
  }

  return chunks;
};

// Store document chunks and their embeddings
export const storeDocumentEmbeddings = async (
  documentId: string,
  pageTexts: { text: string; pageNumber: number }[]
) => {
  // Process each page
  for (const { text, pageNumber } of pageTexts) {
    // Split text into chunks
    const chunks = splitTextIntoChunks(text, pageNumber);
    
    // Create embeddings for chunks
    for (const chunk of chunks) {
      const [embedding] = await embeddings.embedDocuments([chunk.content]);
      
      // Store in database
      await db.documentChunk.create({
        data: {
          documentId,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkNumber: chunk.chunkNumber,
          embedding,
        },
      });
    }
  }
};

// Find similar chunks for a query
export const findSimilarChunks = async (documentId: string, query: string, limit = 5) => {
  // Create embedding for the query
  const [queryEmbedding] = await embeddings.embedDocuments([query]);
  
  // Find similar chunks in the database
  const similarChunks = await db.$queryRaw`
    SELECT 
      id, 
      content, 
      "pageNumber",
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "DocumentChunk"
    WHERE "documentId" = ${documentId}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  
  return similarChunks;
};