'use client';

import { useEffect, useRef } from 'react';

export interface PDFAnnotatorProps {
  pageNumber: number;
  scale: number;
  annotations: Array<{
    id: string;
    type: string;
    content: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    color: string;
  }>;
  documentId: string;
}

export default function PDFAnnotator({ pageNumber, scale, annotations, documentId }: PDFAnnotatorProps) {
  const annotationLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!annotationLayerRef.current) return;

    // Clear existing annotations
    annotationLayerRef.current.innerHTML = '';

    // Render annotations
    annotations.forEach((annotation) => {
      const element = document.createElement('div');
      element.className = 'absolute pointer-events-none';
      element.style.left = `${annotation.position.x * scale}px`;
      element.style.top = `${annotation.position.y * scale}px`;
      element.style.width = `${annotation.position.width * scale}px`;
      element.style.height = `${annotation.position.height * scale}px`;
      element.style.border = `2px solid ${annotation.color}`;
      element.style.backgroundColor = `${annotation.color}33`; // 20% opacity
      element.title = annotation.content;

      annotationLayerRef.current?.appendChild(element);
    });
  }, [annotations, scale]);

  return (
    <div
      ref={annotationLayerRef}
      className="absolute inset-0 pointer-events-none"
      data-testid={`pdf-annotator-${documentId}-${pageNumber}`}
    />
  );
}