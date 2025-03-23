'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Home, 
  FileText, 
  Upload, 
  Clock, 
  Star, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ 
  collapsed = false, 
  onToggleCollapse 
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recent documents on component mount
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const response = await fetch('/api/documents/recent');
        
        if (response.ok) {
          const data = await response.json();
          setRecentDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchRecentDocuments();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <aside className={`bg-white border-r border-gray-200 h-full transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Collapse toggle button */}
      <div className="flex justify-end p-2">
        <button 
          onClick={onToggleCollapse} 
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="px-3 py-3">
        <div className={`${collapsed ? 'space-y-4' : 'space-y-1'}`}>
          <Link 
            href="/dashboard" 
            className={`flex items-center p-2 rounded-md ${
              pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Dashboard</span>}
          </Link>

          <Link 
            href="/dashboard" 
            className={`flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <FileText className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-medium">My Documents</span>}
          </Link>

          <Link 
            href="/dashboard?upload=true" 
            className={`flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Upload className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Upload New</span>}
          </Link>
        </div>
      </nav>

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-3 my-3"></div>

      {/* Recent documents */}
      {!collapsed && (
        <div className="px-3 py-2">
          <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Documents
          </h4>
          
          <div className="mt-2 space-y-1">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <Link 
                  key={doc.id} 
                  href={`/study/${doc.id}`}
                  className={`flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
                    pathname === `/study/${doc.id}` ? 'bg-gray-100' : ''
                  }`}
                >
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-2 text-sm truncate">{doc.title}</span>
                </Link>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">No recent documents</div>
            )}
          </div>
        </div>
      )}

      {/* Quick actions for collapsed mode */}
      {collapsed && (
        <div className="px-3 py-2">
          <div className="space-y-4">
            <button className="flex justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 w-full">
              <Clock className="h-5 w-5" />
            </button>
            <button className="flex justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 w-full">
              <Star className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-gray-200">
        <Link 
          href="/settings" 
          className={`flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}