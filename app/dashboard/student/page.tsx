"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Session {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  price: number;
  mentor: {
    fullName: string;
    language: string;
  };
}

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  session: Session;
  bookedDate: string;
  bookedTime: string;
  paymentSlipUrl?: string;
}

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'booked'>('explore');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment'>('details');
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Generate time slots based on session duration
  const generateTimeSlots = (duration: number) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = Math.floor((hour * 60 + minute + duration) / 60);
        const endMinute = (hour * 60 + minute + duration) % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        if (endHour <= 18) {
          slots.push({
            value: startTime,
            label: `${startTime} - ${endTime}`
          });
        }
      }
    }
    
    return slots;
  };

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

  const handleBookSession = async () => {
    if (bookingStep === 'details') {
      // Step 1: Create initial booking
      if (!selectedSession || !selectedDate || !selectedTime) {
        alert('Please select a date and time for your session.');
        return;
      }

      setIsBooking(true);
      try {
        console.log('📝 Creating initial booking:', selectedSession.id, selectedDate, selectedTime);
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId: selectedSession.id,
            bookedDate: selectedDate.toISOString().split('T')[0],
            bookedTime: selectedTime
          }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Initial booking created:', data.booking);
          setPendingBookingId(data.booking.id);
          setBookingStep('payment');
        } else {
          const error = await response.json();
          console.log('❌ Failed to create booking:', error);
          alert(error.error || 'Failed to create booking');
        }
      } catch (error) {
        console.error('🚨 Booking error:', error);
        alert('Network error. Please try again.');
      } finally {
        setIsBooking(false);
      }
    } else if (bookingStep === 'payment') {
      // Step 2: Upload payment slip and confirm booking
      if (!paymentSlip) {
        alert('Please upload a payment slip.');
        return;
      }

      if (!pendingBookingId) {
        alert('Booking ID not found. Please try again.');
        return;
      }

      setIsBooking(true);
      try {
        console.log('📝 Uploading payment slip for booking:', pendingBookingId);
        const formData = new FormData();
        formData.append('bookingId', pendingBookingId);
        formData.append('paymentSlip', paymentSlip);

        const response = await fetch('/api/bookings', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (response.ok) {
          console.log('✅ Payment slip uploaded and booking confirmed');
          alert('Payment slip uploaded successfully! Your booking is now confirmed.');
          setIsBookingDialogOpen(false);
          resetBookingForm();
          // Reload data to update the UI
          loadData();
        } else {
          const error = await response.json();
          console.log('❌ Failed to upload payment slip:', error);
          alert(error.error || 'Failed to upload payment slip');
        }
      } catch (error) {
        console.error('🚨 Payment slip upload error:', error);
        alert('Network error. Please try again.');
      } finally {
        setIsBooking(false);
      }
    }
  };

  const resetBookingForm = () => {
    setSelectedSession(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setPaymentSlip(null);
    setBookingStep('details');
    setPendingBookingId(null);
  };

  const handlePaymentSlipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only images (JPEG, PNG, GIF) and PDF files are allowed');
        return;
      }
      
      setPaymentSlip(file);
    }
  };

  const handlePaymentSlipUpload = async (bookingId: string, file: File) => {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPEG, PNG, GIF) and PDF files are allowed');
      return;
    }

    try {
      console.log('📝 Uploading payment slip for existing booking:', bookingId);
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('paymentSlip', file);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ Payment slip uploaded successfully');
        alert('Payment slip uploaded successfully! Your booking is now confirmed.');
        // Reload data to update the UI
        loadData();
      } else {
        const error = await response.json();
        console.log('❌ Failed to upload payment slip:', error);
        alert(error.error || 'Failed to upload payment slip');
      }
    } catch (error) {
      console.error('🚨 Payment slip upload error:', error);
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
              <img src="/img.jpg" alt="Edu Vibe Logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="ml-2 text-xl font-bold text-gray-900">Edu Vibe</span>
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
                              <span className="text-gray-500">Language:</span>
                              <span className="font-medium">{session.mentor.language}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span>{session.duration} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${session.price}</span>
                            </div>
                          </div>
                          
                          <Dialog open={isBookingDialogOpen && selectedSession?.id === session.id} onOpenChange={setIsBookingDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedSession(session)}
                                className="w-full bg-black hover:bg-gray-800 text-white"
                              >
                                Book Session
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  {bookingStep === 'details' ? `Book Session: ${session.title}` : 'Upload Payment Slip'}
                                </DialogTitle>
                                {bookingStep === 'payment' && (
                                  <div className="text-sm text-gray-600 mt-2">
                                    Session: {session.title} | Date: {selectedDate?.toLocaleDateString()} | Time: {selectedTime}
                                  </div>
                                )}
                              </DialogHeader>
                              
                              {/* Step indicators */}
                              <div className="flex items-center space-x-4 mb-4">
                                <div className={`flex items-center space-x-2 ${bookingStep === 'details' ? 'text-blue-600' : 'text-green-600'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                    bookingStep === 'details' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                                  }`}>
                                    1
                                  </div>
                                  <span className="text-sm font-medium">Session Details</span>
                                </div>
                                <div className={`w-8 h-0.5 ${bookingStep === 'payment' ? 'bg-blue-300' : 'bg-gray-300'}`}></div>
                                <div className={`flex items-center space-x-2 ${bookingStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                    bookingStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                                  }`}>
                                    2
                                  </div>
                                  <span className="text-sm font-medium">Payment</span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {bookingStep === 'details' ? (
                                  <>
                                    <div>
                                      <Label>Select Date</Label>
                                      <CustomCalendar
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date()}
                                        className="rounded-md border"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label>Select Time Slot</Label>
                                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Choose a time slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {generateTimeSlots(session.duration).map((slot) => (
                                            <SelectItem key={slot.value} value={slot.value}>
                                              {slot.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> After selecting your preferred date and time, you'll need to upload a payment slip to confirm your booking.
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm text-green-800 mb-2">
                                        <strong>Session Reserved!</strong> Please upload your payment slip to confirm the booking.
                                      </p>
                                      <p className="text-sm text-green-700">
                                        Session Price: <strong>${session.price}</strong>
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="payment-slip">Upload Payment Slip</Label>
                                      <Input
                                        id="payment-slip"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handlePaymentSlipChange}
                                        className="mt-2"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Accepted formats: JPG, PNG, GIF, PDF (Max size: 5MB)
                                      </p>
                                      {paymentSlip && (
                                        <p className="text-sm text-green-600 mt-2">
                                          ✓ Selected: {paymentSlip.name}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex space-x-2 pt-4">
                                  {bookingStep === 'details' ? (
                                    <Button
                                      onClick={handleBookSession}
                                      disabled={isBooking || !selectedDate || !selectedTime}
                                      className="flex-1 bg-black hover:bg-gray-800 text-white"
                                    >
                                      {isBooking ? 'Creating...' : 'Next: Payment'}
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline"
                                        onClick={() => setBookingStep('details')}
                                        disabled={isBooking}
                                      >
                                        Back
                                      </Button>
                                      <Button
                                        onClick={handleBookSession}
                                        disabled={isBooking || !paymentSlip}
                                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                                      >
                                        {isBooking ? 'Uploading...' : 'Confirm Booking'}
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsBookingDialogOpen(false);
                                      resetBookingForm();
                                    }}
                                    disabled={isBooking}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
                      className="mt-4 bg-black hover:bg-gray-800 text-white"
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
                          <div className="flex items-center space-x-2">
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </div>
                            {booking.status === 'PENDING' && (
                              <span className="text-xs text-yellow-700">
                                Payment Required
                              </span>
                            )}
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
                              <span className="text-gray-500">Language:</span>
                              <span className="font-medium">{booking.session.mentor.language}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span>{booking.session.duration} minutes</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Booked Date:</span>
                              <span>{new Date(booking.bookedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Booked Time:</span>
                              <span>{booking.bookedTime}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${booking.session.price}</span>
                            </div>
                            {booking.paymentSlipUrl && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Slip:</span>
                                <a 
                                  href={booking.paymentSlipUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  View Receipt
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {/* Payment slip upload for pending bookings */}
                          {booking.status === 'PENDING' && !booking.paymentSlipUrl && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="space-y-3">
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    <strong>Action Required:</strong> Upload your payment slip to confirm this booking.
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor={`payment-slip-${booking.id}`} className="text-sm font-medium">
                                    Upload Payment Slip
                                  </Label>
                                  <Input
                                    id={`payment-slip-${booking.id}`}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handlePaymentSlipUpload(booking.id, file);
                                    }}
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    JPG, PNG, GIF, PDF (Max 5MB)
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
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