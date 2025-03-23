import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getUserDocuments } from '@/lib/pdf';
import PDFUploader from '@/components/pdf/PdfUploader';
import { PdfDocument } from '@/types/pdf';

export const metadata: Metadata = {
  title: 'Dashboard | AI PDF Tutor',
  description: 'Your AI PDF Tutor Dashboard',
};

export default async function DashboardPage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // Get user's documents
  const documents = await getUserDocuments(session?.user?.id);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Documents</h1>
      </div>
      
      <div className="mb-8">
        <PDFUploader />
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 mb-4">You haven't uploaded any documents yet</h3>
          <p className="text-gray-500 mb-6">Upload a PDF to start learning with AI assistance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document: PdfDocument) => (
            <Link 
              href={`/study/${document.id}`} 
              key={document.id}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">{document.title}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {document.fileName} • {document.pageCount} pages
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Study Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}