"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Student {
  id: string;
  email: string;
  name?: string;
  age?: number;
  profilePicture?: string;
}

interface Booking {
  id: string;
  status: string;
  student: Student;
  createdAt?: string;
}

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
  bookings: Booking[];
}

export default function MentorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'create' | 'analytics'>('analytics');
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

  // Analytics data processing
  const analyticsData = useMemo(() => {
    const allBookings = sessions.flatMap(session => 
      session.bookings.map(booking => ({
        ...booking,
        sessionSubject: session.subject,
        sessionDate: session.date,
        sessionTime: session.time,
        sessionTitle: session.title
      }))
    );

    // Generate mock student data for demonstration
    const enhancedBookings = allBookings.map(booking => ({
      ...booking,
      student: {
        ...booking.student,
        name: booking.student.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        age: 18 + Math.floor(Math.random() * 25), // Random age between 18-42
        profilePicture: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=40&h=40&fit=crop&crop=face`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      }
    }));

    // Age grouping for pie chart
    const ageGroups = enhancedBookings.reduce((acc, booking) => {
      const age = booking.student.age || 20;
      let group;
      if (age < 20) group = '< 20';
      else if (age < 25) group = '20-24';
      else if (age < 30) group = '25-29';
      else if (age < 35) group = '30-34';
      else group = '35+';
      
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ageChartData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

    // Subject interests for bar chart
    const subjectInterests = enhancedBookings.reduce((acc, booking) => {
      acc[booking.sessionSubject] = (acc[booking.sessionSubject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const subjectChartData = Object.entries(subjectInterests)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);

    // Booked sessions sorted by date
    const bookedSessions = enhancedBookings
      .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
      .slice(0, 10); // Show latest 10 bookings

    return {
      ageChartData,
      subjectChartData,
      bookedSessions,
      totalBookings: enhancedBookings.length,
      totalRevenue: enhancedBookings.length * 50 // Mock revenue calculation
    };
  }, [sessions]);

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
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
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
            {activeTab === 'analytics' ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
                  <p className="text-gray-600">Overview of your mentoring sessions and student insights</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                          <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                          <p className="text-2xl font-bold text-gray-900">{sessions.filter(s => s.isActive).length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                          <p className="text-2xl font-bold text-gray-900">4.8</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Age Distribution Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Age Distribution</CardTitle>
                      <p className="text-sm text-gray-600">Age groups of students who booked your sessions</p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.ageChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {analyticsData.ageChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subject Interests Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Interest Breakdown</CardTitle>
                      <p className="text-sm text-gray-600">Popular subjects among your students</p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="horizontal"
                            data={analyticsData.subjectChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="subject" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <p className="text-sm text-gray-600">All booked sessions sorted by date</p>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.bookedSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No bookings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analyticsData.bookedSessions.map((booking, index) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {booking.student.name?.charAt(0) || booking.student.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{booking.student.name || booking.student.email}</h4>
                                <p className="text-sm text-gray-600">{booking.sessionTitle}</p>
                                <p className="text-xs text-gray-500">
                                  Booked on {new Date(booking.student.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {new Date(booking.sessionDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">{booking.sessionTime}</p>
                              <Button size="sm" className="mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                Start Session
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : activeTab === 'sessions' ? (
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