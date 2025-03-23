'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PDFUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    
    // Check if file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    // Check file size (max 10MB or as configured)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    setFile(selectedFile);
    
    // Use filename (without extension) as default title
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setFile(null);
    setTitle('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
      
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload PDF');
      }
      
      // Success - redirect to the study page for the new document
      router.push(`/study/${data.document.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'An unexpected error occurred');
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload a New Document</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your PDF here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Maximum file size: 10MB
            </p>
            <button
              type="button"
              onClick={openFileSelector}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="ml-4 p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div>
            <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              id="document-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a title for your document"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}