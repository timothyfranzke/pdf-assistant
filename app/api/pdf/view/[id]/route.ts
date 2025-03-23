import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFileFromLocal } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get document from database
    const document = await db.document.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return new Response('Document not found', { status: 404 });
    }

    // Get the file from local storage
    const fileBuffer = await getFileFromLocal(document.fileKey);

    // Return the file with appropriate headers
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${document.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new Response('Failed to serve PDF', { status: 500 });
  }
}