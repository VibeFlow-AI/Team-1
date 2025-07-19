"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) {
      console.log('⏳ Dashboard: Still loading auth state...');
      return;
    }

    console.log('🔍 Dashboard: Auth state loaded, user:', user);

    if (!user) {
      console.log('❌ Dashboard: No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Redirect based on role
    if (user.role === 'STUDENT') {
      console.log('👨‍🎓 Dashboard: Redirecting student to student dashboard');
      router.push('/dashboard/student');
    } else if (user.role === 'MENTOR') {
      console.log('👨‍🏫 Dashboard: Redirecting mentor to mentor dashboard');
      router.push('/dashboard/mentor');
    }
  }, [user, loading, router]);

  // Show loading while determining redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
} 