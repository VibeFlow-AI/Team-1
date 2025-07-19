import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  subject: z.string().min(1),
  duration: z.number().min(15).max(240),
  price: z.number().min(0),
  date: z.string(),
  time: z.string(),
  maxStudents: z.number().min(1).max(20),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        mentorId: payload.userId,
      },
      include: {
        bookings: {
          include: {
            student: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, subject, duration, price, date, time, maxStudents } = createSessionSchema.parse(body);

    const session = await prisma.session.create({
      data: {
        mentorId: payload.userId,
        title,
        description,
        subject,
        duration,
        price,
        date: new Date(date),
        time,
        maxStudents,
        isActive: true,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 