// components/pdf/DynamicPDFViewer.tsx
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PDFViewer = dynamic(() => import('./PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      <span className="ml-2 text-blue-600 font-medium">Loading PDF viewer...</span>
    </div>
  ),
});

export default PDFViewer;