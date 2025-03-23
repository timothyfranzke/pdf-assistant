import { db } from "./db";
import { PDFDocument } from "pdf-lib";
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.PDF_UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Ensure the upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
};

// Generate a unique file path
export const generateFilePath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const userDir = path.join(UPLOAD_DIR, userId);
  
  // Ensure user directory exists
  fs.mkdir(userDir, { recursive: true }).catch(console.error);
  
  return path.join(userId, `${timestamp}-${sanitizedFileName}`);
};

// Save file to local file system
export const saveFileToLocal = async (
  file: Buffer,
  filePath: string
): Promise<string> => {
  await ensureUploadDir();
  const fullPath = path.join(UPLOAD_DIR, filePath);
  await fs.writeFile(fullPath, file);
  return filePath;
};

// Get file from local file system
export const getFileFromLocal = async (filePath: string): Promise<Buffer> => {
    // Ensure we're using an absolute path
    const absolutePath = filePath.startsWith('/') 
      ? filePath 
      : path.join(UPLOAD_DIR, filePath);
    
    try {
      return await fs.readFile(absolutePath);
    } catch (error: any) {
      console.error(`Error reading file at ${absolutePath}:`, error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  };
// Extract PDF metadata like page count
export const extractPdfMetadata = async (pdfBuffer: Buffer): Promise<{ pageCount: number }> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    return { pageCount };
  } catch (error) {
    console.error("Error extracting PDF metadata:", error);
    return { pageCount: 0 };
  }
};

// Store PDF document in the database
export const storePdfDocument = async ({
  userId,
  title,
  fileName,
  fileKey,
  fileSize,
  pageCount,
}: {
  userId: string;
  title: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  pageCount: number;
}) => {
  return db.document.create({
    data: {
      userId,
      title,
      fileName,
      fileKey,
      fileSize,
      pageCount,
    },
  });
};

// Get documents for a user
export const getUserDocuments = async (userId: string) => {
  return db.document.findMany({
    where: {
      userId,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });
};

// Get a specific document with full details
export const getDocument = async (documentId: string, userId: string) => {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
      userId, // Ensure the user has access to this document
    },
    include: {
      annotations: true,
      conversations: {
        include: {
          messages: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1, // Get the most recent conversation
      },
    },
  });

  if (!document) return null;

  return {
    ...document,
  };
};

// Save an annotation to the database
export const saveAnnotation = async ({
  documentId,
  type,
  content,
  pageNumber,
  position,
  color,
  messageId,
}: {
  documentId: string;
  type: string;
  content?: string;
  pageNumber: number;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  messageId?: string;
}) => {
  return db.annotation.create({
    data: {
      documentId,
      type,
      content,
      pageNumber,
      position,
      color,
      messageId,
    },
  });
};