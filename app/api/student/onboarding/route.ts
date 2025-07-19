import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const onboardingSchema = z.object({
  // Part 1: Basic Information
  fullName: z.string().min(1),
  age: z.number().min(1).max(100),
  contactNumber: z.string().min(1),
  
  // Part 2: Academic Background
  currentEducationLevel: z.enum(['GRADE_9', 'ORDINARY_LEVEL', 'ADVANCED_LEVEL']),
  school: z.string().min(1),
  
  // Part 3: Subject & Skill Assessment
  subjectsOfInterest: z.string().min(1),
  currentYear: z.number().min(1),
  skillLevels: z.record(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])),
  preferredLearningStyle: z.enum(['VISUAL', 'HANDS_ON', 'THEORETICAL', 'MIXED']),
  learningDisabilities: z.string().optional(),
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
    if (!payload || payload.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid token or unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = onboardingSchema.parse(body);

    // Create or update student profile
    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: payload.userId },
      update: {
        fullName: data.fullName,
        age: data.age,
        contactNumber: data.contactNumber,
        currentEducationLevel: data.currentEducationLevel,
        school: data.school,
        subjectsOfInterest: data.subjectsOfInterest,
        currentYear: data.currentYear,
        skillLevels: data.skillLevels,
        preferredLearningStyle: data.preferredLearningStyle,
        learningDisabilities: data.learningDisabilities,
      },
      create: {
        userId: payload.userId,
        fullName: data.fullName,
        age: data.age,
        contactNumber: data.contactNumber,
        currentEducationLevel: data.currentEducationLevel,
        school: data.school,
        subjectsOfInterest: data.subjectsOfInterest,
        currentYear: data.currentYear,
        skillLevels: data.skillLevels,
        preferredLearningStyle: data.preferredLearningStyle,
        learningDisabilities: data.learningDisabilities,
      },
    });

    return NextResponse.json(
      { 
        message: 'Student profile created successfully',
        profile: studentProfile
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Invalid onboarding data' },
      { status: 400 }
    );
  }
}

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

    // Get existing profile data
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: payload.userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
} 