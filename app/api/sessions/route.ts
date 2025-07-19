import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get all active sessions with mentor information
    const sessions = await prisma.session.findMany({
      where: {
        isActive: true,
        date: {
          gte: new Date(), // Only future sessions
        },
      },
      include: {
        mentor: {
          include: {
            mentorProfile: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform the data to include mentor name
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description,
      subject: session.subject,
      duration: session.duration,
      price: session.price,
      date: session.date.toISOString(),
      time: session.time,
      mentor: {
        fullName: session.mentor.mentorProfile?.fullName || 'Unknown Mentor',
      },
    }));

    return NextResponse.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
} 