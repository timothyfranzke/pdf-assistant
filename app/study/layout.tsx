import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return (
    <div className="flex h-screen flex-col">
      {/* Study-specific header could go here if needed */}
      
      {/* Main content area - takes full height */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}