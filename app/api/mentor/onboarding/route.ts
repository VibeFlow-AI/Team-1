import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const onboardingSchema = z.object({
  fullName: z.string().min(1),
  age: z.number().min(1).max(100),
  contactNumber: z.string().min(1),
  expertise: z.string().min(1),
  experience: z.number().min(0),
  bio: z.string().min(1),
  hourlyRate: z.number().min(0),
});

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
    if (!payload || payload.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Invalid token or unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = onboardingSchema.parse(body);

    // Create or update mentor profile
    const mentorProfile = await prisma.mentorProfile.upsert({
      where: { userId: payload.userId },
      update: {
        fullName: data.fullName,
        age: data.age,
        contactNumber: data.contactNumber,
        expertise: data.expertise,
        experience: data.experience,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
      },
      create: {
        userId: payload.userId,
        fullName: data.fullName,
        age: data.age,
        contactNumber: data.contactNumber,
        expertise: data.expertise,
        experience: data.experience,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
      },
    });

    return NextResponse.json(
      { 
        message: 'Mentor profile created successfully',
        profile: mentorProfile
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mentor onboarding error:', error);
    return NextResponse.json(
      { error: 'Invalid onboarding data' },
      { status: 400 }
    );
  }
} 