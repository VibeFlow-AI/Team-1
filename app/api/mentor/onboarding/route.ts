import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const onboardingSchema = z.object({
  fullName: z.string().min(1),
  age: z.number().min(1).max(100),
  email: z.string().email(),
  contactNumber: z.string().min(1),
  preferredLanguage: z.string().min(1),
  currentLocation: z.string().min(1),
  shortBio: z.string().min(1),
  professionalRole: z.string().min(1),
  subjects: z.string(), // JSON string of subjects array
  teachingExperience: z.string().min(1),
  preferredLevels: z.string(), // JSON string of preferred levels array
  linkedinProfile: z.string().min(1), // Changed from URL to string to be more flexible
  githubPortfolio: z.string().optional(),
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

    // Parse form data
    const formData = await request.formData();
    
    // Log all form data for debugging
    console.log('📝 Mentor onboarding - Form data received:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Extract and validate data
    const data = {
      fullName: formData.get('fullName') as string,
      age: parseInt(formData.get('age') as string) || 0,
      email: formData.get('email') as string,
      contactNumber: formData.get('contactNumber') as string,
      preferredLanguage: formData.get('preferredLanguage') as string,
      currentLocation: formData.get('currentLocation') as string,
      shortBio: formData.get('shortBio') as string,
      professionalRole: formData.get('professionalRole') as string,
      subjects: formData.get('subjects') as string,
      teachingExperience: formData.get('teachingExperience') as string,
      preferredLevels: formData.get('preferredLevels') as string,
      linkedinProfile: formData.get('linkedinProfile') as string,
      githubPortfolio: formData.get('githubPortfolio') as string || '',
    };

    console.log('📝 Mentor onboarding - Extracted data:', data);

    // Validate the data
    try {
      const validatedData = onboardingSchema.parse(data);
      console.log('✅ Mentor onboarding - Data validation passed');
    } catch (validationError) {
      console.error('❌ Mentor onboarding - Validation error:', validationError);
      return NextResponse.json(
        { error: `Validation failed: ${validationError}` },
        { status: 400 }
      );
    }

    const validatedData = onboardingSchema.parse(data);

    // Parse JSON arrays
    let subjects = [];
    let preferredLevels = [];
    
    try {
      subjects = JSON.parse(validatedData.subjects || '[]');
      preferredLevels = JSON.parse(validatedData.preferredLevels || '[]');
      console.log('✅ Mentor onboarding - JSON parsing successful');
    } catch (parseError) {
      console.error('❌ Mentor onboarding - JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON data in subjects or preferredLevels' },
        { status: 400 }
      );
    }

    // Handle profile picture upload (if provided)
    const profilePicture = formData.get('profilePicture') as File | null;
    let profilePictureUrl = null;

    if (profilePicture && profilePicture.size > 0) {
      // In a real application, you would upload to a cloud storage service
      // For now, we'll just store the filename
      profilePictureUrl = `uploads/${Date.now()}_${profilePicture.name}`;
    }

    console.log('📝 Mentor onboarding - Creating/updating profile...');

    // Create or update mentor profile
    const mentorProfile = await prisma.mentorProfile.upsert({
      where: { userId: payload.userId },
      update: {
        fullName: validatedData.fullName,
        age: validatedData.age,
        email: validatedData.email,
        contactNumber: validatedData.contactNumber,
        preferredLanguage: validatedData.preferredLanguage,
        currentLocation: validatedData.currentLocation,
        shortBio: validatedData.shortBio,
        professionalRole: validatedData.professionalRole,
        subjects: subjects,
        teachingExperience: validatedData.teachingExperience,
        preferredLevels: preferredLevels,
        linkedinProfile: validatedData.linkedinProfile,
        githubPortfolio: validatedData.githubPortfolio,
        profilePictureUrl: profilePictureUrl,
        // Legacy fields with default values
        expertise: subjects.join(', '),
        experience: 3,
        bio: validatedData.shortBio,
        hourlyRate: 25.0,
      },
      create: {
        userId: payload.userId,
        fullName: validatedData.fullName,
        age: validatedData.age,
        email: validatedData.email,
        contactNumber: validatedData.contactNumber,
        preferredLanguage: validatedData.preferredLanguage,
        currentLocation: validatedData.currentLocation,
        shortBio: validatedData.shortBio,
        professionalRole: validatedData.professionalRole,
        subjects: subjects,
        teachingExperience: validatedData.teachingExperience,
        preferredLevels: preferredLevels,
        linkedinProfile: validatedData.linkedinProfile,
        githubPortfolio: validatedData.githubPortfolio,
        profilePictureUrl: profilePictureUrl,
        // Legacy fields with default values
        expertise: subjects.join(', '),
        experience: 3,
        bio: validatedData.shortBio,
        hourlyRate: 25.0,
      },
    });

    console.log('✅ Mentor onboarding - Profile created/updated successfully');

    // Update user to mark as having profile
    await prisma.user.update({
      where: { id: payload.userId },
      data: { hasProfile: true },
    });

    console.log('✅ Mentor onboarding - User profile status updated');

    return NextResponse.json(
      { 
        message: 'Mentor profile created successfully',
        profile: mentorProfile
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('🚨 Mentor onboarding error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 