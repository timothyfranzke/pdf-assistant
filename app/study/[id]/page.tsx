import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDocument } from '@/lib/pdf';
import { createConversation } from '@/lib/ai';
import StudyClient from '@/components/layout/StudyClient';

type Props = {
  params: { id: string };
};

export default async function StudyPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = params;
  const document = await getDocument(id, session.user.id);

  if (!document) {
    notFound();
  }

  let conversation;
  try {
    conversation = await createConversation(document.id);
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }

  return (
    <StudyClient
      pdfUrl={`http://localhost:3000/api/pdf/view/${id}`}
      documentId={document.id}
      annotations={document.annotations || []}
      conversationId={conversation.id}
      initialMessages={[]}
    />
  );
}