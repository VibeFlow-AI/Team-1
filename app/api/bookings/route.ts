import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { savePaymentSlip, validatePaymentSlip } from '@/lib/file-upload';
import { z } from 'zod';

const bookSessionSchema = z.object({
  sessionId: z.string(),
  bookedDate: z.string(),
  bookedTime: z.string(),
});

const uploadPaymentSlipSchema = z.object({
  bookingId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid token or unauthorized' },
        { status: 401 }
      );
    }

    // Get user's bookings with session and mentor information
    const bookings = await prisma.booking.findMany({
      where: {
        studentId: payload.userId,
      },
      include: {
        session: {
          include: {
            mentor: {
              include: {
                mentorProfile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      status: booking.status,
      bookedDate: booking.bookedDate,
      bookedTime: booking.bookedTime,
      paymentSlipUrl: booking.paymentSlipUrl,
      session: {
        id: booking.session.id,
        title: booking.session.title,
        description: booking.session.description,
        subject: booking.session.subject,
        duration: booking.session.duration,
        price: booking.session.price,
        date: booking.session.date.toISOString(),
        time: booking.session.time,
        mentor: {
          fullName: booking.session.mentor.mentorProfile?.fullName || 'Unknown Mentor',
          language: booking.session.mentor.mentorProfile?.preferredLanguage || 'English',
        },
      },
    }));

    return NextResponse.json({ bookings: transformedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid token or unauthorized' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle form data (with payment slip upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const bookingId = formData.get('bookingId') as string;
      const paymentSlip = formData.get('paymentSlip') as File;

      if (!bookingId || !paymentSlip) {
        return NextResponse.json(
          { error: 'Booking ID and payment slip are required' },
          { status: 400 }
        );
      }

      // Validate the uploaded file
      const validation = validatePaymentSlip(paymentSlip);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Check if booking exists and belongs to the user
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      if (booking.studentId !== payload.userId) {
        return NextResponse.json(
          { error: 'Unauthorized to update this booking' },
          { status: 403 }
        );
      }

      // Save the payment slip
      const paymentSlipUrl = await savePaymentSlip(paymentSlip, bookingId);

      // Update booking with payment slip and confirm the booking
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentSlipUrl,
          status: 'CONFIRMED',
        },
      });

      return NextResponse.json(
        { 
          message: 'Payment slip uploaded and booking confirmed',
          booking: updatedBooking 
        },
        { status: 200 }
      );
    }

    // Handle JSON data (initial booking creation)
    else {
      const body = await request.json();
      const { sessionId, bookedDate, bookedTime } = bookSessionSchema.parse(body);

      // Check if session exists and is active
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      if (!session.isActive) {
        return NextResponse.json(
          { error: 'Session is not available' },
          { status: 400 }
        );
      }

      // Check if session is in the future
      if (session.date < new Date()) {
        return NextResponse.json(
          { error: 'Session has already passed' },
          { status: 400 }
        );
      }

      // Check if user has already booked this session
      const existingBooking = await prisma.booking.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: payload.userId,
          },
        },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: 'You have already booked this session' },
          { status: 400 }
        );
      }

      // Create the booking with PENDING status (awaiting payment)
      const booking = await prisma.booking.create({
        data: {
          sessionId,
          studentId: payload.userId,
          status: 'PENDING',
          bookedDate,
          bookedTime,
        },
      });

      return NextResponse.json(
        { 
          message: 'Session booked successfully. Please upload payment slip to confirm.',
          booking 
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Book session error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 