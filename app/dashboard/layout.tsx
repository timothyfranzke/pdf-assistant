import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { LogOut, User, FileText, Home } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center">
            <span className="font-bold text-xl text-blue-600">AI PDF Tutor</span>
          </Link>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2">
            <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
              Navigation
            </h3>
            
            <div className="mt-3 space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Home className="mr-3 h-5 w-5 text-gray-500" />
                Dashboard
              </Link>
              
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <FileText className="mr-3 h-5 w-5 text-gray-500" />
                My Documents
              </Link>
            </div>
          </div>
          
          <div className="px-4 py-2 mt-8">
            <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
              Account
            </h3>
            
            <div className="mt-3 space-y-1">
              <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md">
                <User className="mr-3 h-5 w-5 text-gray-500" />
                {session.user.name || session.user.email}
              </div>
              
              <Link 
                href="/api/auth/signout"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                Sign Out
              </Link>
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white w-full p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard" className="font-bold text-lg text-blue-600">
          AI PDF Tutor
        </Link>
        
        <div className="flex items-center">
          <Link href="/api/auth/signout" className="text-gray-600">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}