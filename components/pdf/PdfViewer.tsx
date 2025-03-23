'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import PDFAnnotator from './PdfAnnotator';


// Initialize PDF.js worker in useEffect
let pdfjsWorkerLoaded = false;

interface PDFViewerProps {
    pdfUrl: string;
    initialPage?: number;
    onPageChange?: (page: number) => void;
    annotations?: any[];
    documentId: string;
    onTextExtracted?: (text: string) => void; // Add this prop
  }
  
  export default function PDFViewer({
    pdfUrl,
    initialPage = 1,
    onPageChange,
    annotations = [],
    documentId,
    onTextExtracted,
  }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  console.log('pdfUrl', pdfUrl);

  // Initialize PDF.js worker
  useEffect(() => {
    if (!pdfjsWorkerLoaded) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      pdfjsWorkerLoaded = true;
    }
    setIsClient(true);
  }, []);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    
    // Extract text if the callback is provided
    if (onTextExtracted) {
      extractTextFromPdf();
    }
  };

  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setLoading(false);
  };

  const extractTextFromPdf = async () => {
    try {
      // Load the PDF document
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        fullText += `\n--- Page ${i} ---\n${pageText}`;
      }
      
      // Call the callback with the extracted text
      onTextExtracted?.(fullText);
    } catch (error) {
      console.error('Error extracting PDF text:', error);
    }
  };

  // Update container width on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Navigation functions
  const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(numPages, prev + 1));
  const zoomIn = () => setScale(prev => Math.min(2, prev + 0.1));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.1));

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Error loading PDF: {error}
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                width={containerWidth * 0.9}
                renderAnnotationLayer={false}
                renderTextLayer={true}
              >
                <PDFAnnotator
                  pageNumber={pageNumber}
                  scale={scale}
                  annotations={annotations.filter(a => a.pageNumber === pageNumber)}
                  documentId={documentId}
                />
              </Page>
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}