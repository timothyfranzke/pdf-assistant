export interface PdfDocument {
  id: string;
  title: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  pageCount: number;
  uploadedAt: Date;
  userId: string;
}

export interface PdfAnnotation {
  id: string;
  documentId: string;
  type: string;
  content?: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  messageId?: string;
  createdAt: Date;
}
