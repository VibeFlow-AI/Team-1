"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Session {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  mentor: {
    fullName: string;
  };
}

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  session: Session;
}

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'booked'>('explore');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while auth is loading
    if (authLoading) {
      console.log('⏳ Student Dashboard: Auth still loading...');
      return;
    }

    console.log('🔍 Student Dashboard: Auth loaded, user:', user);

    if (!user) {
      console.log('❌ Student Dashboard: No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      console.log('❌ Student Dashboard: Not a student, redirecting to main dashboard');
      router.push('/dashboard');
      return;
    }

    if (!user.hasProfile) {
      console.log('📝 Student Dashboard: No profile, redirecting to onboarding');
      router.push('/auth/student/onboarding');
      return;
    }

    console.log('✅ Student Dashboard: User authenticated, loading data');
    loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Loading sessions...');
      // Load available sessions
      const sessionsResponse = await fetch('/api/sessions', {
        credentials: 'include',
      });
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions);
        console.log('✅ Sessions loaded:', sessionsData.sessions.length);
      } else {
        console.log('❌ Failed to load sessions:', sessionsResponse.status);
      }

      console.log('📡 Loading bookings...');
      // Load booked sessions
      const bookingsResponse = await fetch('/api/bookings', {
        credentials: 'include',
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings);
        console.log('✅ Bookings loaded:', bookingsData.bookings.length);
      } else {
        console.log('❌ Failed to load bookings:', bookingsResponse.status);
      }
    } catch (error) {
      console.error('🚨 Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = async (sessionId: string) => {
    try {
      console.log('📝 Booking session:', sessionId);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Session booked successfully');
        // Reload data to update the UI
        loadData();
      } else {
        const error = await response.json();
        console.log('❌ Failed to book session:', error);
        alert(error.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('🚨 Booking error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Student logging out...');
    await logout();
    router.push('/');
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">MentorHub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Explore sessions and manage your bookings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explore'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explore Sessions
            </button>
            <button
              onClick={() => setActiveTab('booked')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'booked'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Booked Sessions
            </button>
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'explore' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Sessions</h2>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No sessions available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <p className="text-sm text-blue-600 font-medium">{session.subject}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">{session.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Mentor:</span>
                              <span className="font-medium">{session.mentor.fullName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span>{session.duration} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Date:</span>
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Time:</span>
                              <span>{session.time}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${session.price}</span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleBookSession(session.id)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            Book Session
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Booked Sessions</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">You haven't booked any sessions yet.</p>
                    <Button
                      onClick={() => setActiveTab('explore')}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Explore Sessions
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{booking.session.title}</CardTitle>
                          <p className="text-sm text-blue-600 font-medium">{booking.session.subject}</p>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">{booking.session.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Mentor:</span>
                              <span className="font-medium">{booking.session.mentor.fullName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span>{booking.session.duration} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Date:</span>
                              <span>{new Date(booking.session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Time:</span>
                              <span>{booking.session.time}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${booking.session.price}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 