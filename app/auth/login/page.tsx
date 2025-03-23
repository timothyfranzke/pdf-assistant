import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | AI PDF Tutor',
  description: 'Sign in to your AI PDF Tutor account',
};

export default async function LoginPage() {
  // Check if user is already logged in
  // const session = await getServerSession(authOptions);
  
  // if (session) {
  //   redirect('/dashboard');
  // }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">AI PDF Tutor</h1>
          <p className="mt-2 text-gray-600">Learn with AI assistance</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}