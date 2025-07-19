"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Session {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  isActive: boolean;
  bookings: {
    id: string;
    status: string;
    student: {
      email: string;
    };
  }[];
}

export default function MentorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'create'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    price: 0,
    date: '',
    time: '',
    maxStudents: 1,
  });
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while auth is loading
    if (authLoading) {
      console.log('⏳ Mentor Dashboard: Auth still loading...');
      return;
    }

    console.log('🔍 Mentor Dashboard: Auth loaded, user:', user);

    if (!user) {
      console.log('❌ Mentor Dashboard: No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'MENTOR') {
      console.log('❌ Mentor Dashboard: Not a mentor, redirecting to main dashboard');
      router.push('/dashboard');
      return;
    }

    if (!user.hasProfile) {
      console.log('📝 Mentor Dashboard: No profile, redirecting to onboarding');
      router.push('/auth/mentor/onboarding');
      return;
    }

    console.log('✅ Mentor Dashboard: User authenticated, loading data');
    loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Loading mentor sessions...');
      // Load mentor's sessions
      const response = await fetch('/api/mentor/sessions', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        console.log('✅ Mentor sessions loaded:', data.sessions.length);
      } else {
        console.log('❌ Failed to load mentor sessions:', response.status);
      }
    } catch (error) {
      console.error('🚨 Failed to load mentor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('📝 Creating new session...');
      const response = await fetch('/api/mentor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Session created successfully');
        setShowCreateForm(false);
        setNewSession({
          title: '',
          description: '',
          subject: '',
          duration: 60,
          price: 0,
          date: '',
          time: '',
          maxStudents: 1,
        });
        loadData();
      } else {
        const error = await response.json();
        console.log('❌ Failed to create session:', error);
        alert(error.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('🚨 Session creation error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Mentor logging out...');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
          <p className="text-gray-600">Manage your sessions and view bookings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Sessions
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Session
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
            {activeTab === 'sessions' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Create New Session
                  </Button>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">You haven't created any sessions yet.</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Create Your First Session
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <p className="text-sm text-blue-600 font-medium">{session.subject}</p>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">{session.description}</p>
                          
                          <div className="space-y-2 mb-4">
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
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Bookings:</span>
                              <span>{session.bookings.length}</span>
                            </div>
                          </div>
                          
                          {session.bookings.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Bookings:</h4>
                              <div className="space-y-1">
                                {session.bookings.map((booking) => (
                                  <div key={booking.id} className="text-xs text-gray-600">
                                    {booking.student.email} - {booking.status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Session</h2>
                
                <Card className="max-w-2xl">
                  <CardContent className="pt-6">
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Session Title</Label>
                          <Input
                            id="title"
                            value={newSession.title}
                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                            placeholder="Enter session title"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={newSession.subject}
                            onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                            placeholder="e.g., Mathematics, Physics"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newSession.description}
                          onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                          placeholder="Describe what students will learn..."
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newSession.duration}
                            onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 60 })}
                            min="15"
                            max="240"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newSession.price}
                            onChange={(e) => setNewSession({ ...newSession, price: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="maxStudents">Max Students</Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            value={newSession.maxStudents}
                            onChange={(e) => setNewSession({ ...newSession, maxStudents: parseInt(e.target.value) || 1 })}
                            min="1"
                            max="20"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newSession.date}
                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newSession.time}
                            onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 pt-4">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Create Session
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab('sessions')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 