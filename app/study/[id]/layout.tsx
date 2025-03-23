import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDocument } from '@/lib/pdf';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      title: 'Sign In Required | AI PDF Tutor',
    };
  }

  const { id } = params;
  const document = await getDocument(id, session.user.id);

  if (!document) {
    return {
      title: 'Document Not Found | AI PDF Tutor',
    };
  }

  return {
    title: `${document.title} | AI PDF Tutor`,
    description: `Study "${document.title}" with AI assistance`,
  };
}

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
