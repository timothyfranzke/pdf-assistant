'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Menu, 
  X, 
  BookOpen, 
  LogOut, 
  User,
  ChevronDown 
} from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };
  
  // Determine if user is authenticated and on the dashboard/study pages
  const isAuthenticated = !!session;
  const isInApp = pathname?.startsWith('/dashboard') || pathname?.startsWith('/study');
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI PDF Tutor</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : ''
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>{session?.user?.name || session?.user?.email || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-md focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/dashboard' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}