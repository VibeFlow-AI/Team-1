"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface MentorFormData {
  // Part 1: Personal Information
  fullName: string;
  age: number;
  email: string;
  contactNumber: string;
  preferredLanguage: string;
  currentLocation: string;
  shortBio: string;
  professionalRole: string;
  
  // Part 2: Areas of Expertise
  subjects: string[];
  teachingExperience: string;
  preferredLevels: string[];
  
  // Part 3: Social & Professional Links
  linkedinProfile: string;
  githubPortfolio: string;
  profilePicture: File | null;
}

const LANGUAGES = ['English', 'Sinhala', 'Tamil', 'Other'];
const EXPERIENCE_LEVELS = ['None', '1–3 years', '3–5 years', '5+ years'];
const STUDENT_LEVELS = ['Grade 3-5', 'Grade 6-9', 'Grade 10-11', 'Advanced Level'];
const COMMON_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'History', 'Geography'];

export default function MentorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MentorFormData>({
    fullName: '',
    age: 0,
    email: '',
    contactNumber: '',
    preferredLanguage: '',
    currentLocation: '',
    shortBio: '',
    professionalRole: '',
    subjects: [],
    teachingExperience: '',
    preferredLevels: [],
    linkedinProfile: '',
    githubPortfolio: '',
    profilePicture: null,
  });

  const { user } = useAuth();
  const router = useRouter();

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('mentorOnboardingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    const savedStep = localStorage.getItem('mentorOnboardingStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Set user's email when user data is available
  useEffect(() => {
    if (user && user.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, formData.email]);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('mentorOnboardingData', JSON.stringify(formData));
  }, [formData]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('mentorOnboardingStep', currentStep.toString());
  }, [currentStep]);

  // Check if user already has a profile
  useEffect(() => {
    if (user && user.hasProfile) {
      router.push('/dashboard/mentor');
    }
  }, [user, router]);

  const updateFormData = (field: keyof MentorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredLevels: checked 
        ? [...prev.preferredLevels, level]
        : prev.preferredLevels.filter(l => l !== level)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateFormData('profilePicture', file);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.age > 0 && formData.email && 
               formData.contactNumber && formData.preferredLanguage && 
               formData.currentLocation && formData.shortBio && formData.professionalRole;
      case 2:
        return formData.subjects.length > 0 && formData.teachingExperience && 
               formData.preferredLevels.length > 0;
      case 3:
        return formData.linkedinProfile;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitted || isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Validate all required fields before submission
      console.log('📝 Mentor onboarding - Form data before submission:', formData);
      
      if (!formData.fullName || !formData.age || !formData.email || !formData.contactNumber || 
          !formData.preferredLanguage || !formData.currentLocation || !formData.shortBio || 
          !formData.professionalRole || formData.subjects.length === 0 || !formData.teachingExperience || 
          formData.preferredLevels.length === 0 || !formData.linkedinProfile) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profilePicture') {
          if (value) {
            submitData.append(key, value);
          }
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });

      // Log what we're sending
      console.log('📝 Mentor onboarding - Sending data:');
      for (const [key, value] of submitData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch('/api/mentor/onboarding', {
        method: 'POST',
        body: submitData,
      });

      console.log('📝 Mentor onboarding - Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mentor onboarding - Success:', result);
        setIsSubmitted(true);
        // Clear localStorage
        localStorage.removeItem('mentorOnboardingData');
        localStorage.removeItem('mentorOnboardingStep');
        // Force a page reload to update auth state
        window.location.href = '/dashboard/mentor';
      } else {
        const result = await response.json();
        console.error('❌ Mentor onboarding - Error response:', result);
        setError(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('🚨 Mentor onboarding - Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'MENTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">This page is only for mentors.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Mentor Onboarding</CardTitle>
          <p className="text-gray-600">Complete your mentor profile to get started</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => updateFormData('age', parseInt(e.target.value) || 0)}
                      placeholder="Enter your age"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                      placeholder="Email will be filled automatically"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email is taken from your account</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => updateFormData('contactNumber', e.target.value)}
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredLanguage">Preferred Language *</Label>
                    <Select value={formData.preferredLanguage} onValueChange={(value) => updateFormData('preferredLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currentLocation">Current Location *</Label>
                    <Input
                      id="currentLocation"
                      value={formData.currentLocation}
                      onChange={(e) => updateFormData('currentLocation', e.target.value)}
                      placeholder="Enter your current location"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="professionalRole">Professional Role *</Label>
                  <Input
                    id="professionalRole"
                    value={formData.professionalRole}
                    onChange={(e) => updateFormData('professionalRole', e.target.value)}
                    placeholder="e.g., Teacher, Professor, Industry Professional"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="shortBio">Short Bio *</Label>
                  <Textarea
                    id="shortBio"
                    value={formData.shortBio}
                    onChange={(e) => updateFormData('shortBio', e.target.value)}
                    placeholder="Introduce yourself in 2–3 sentences"
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Areas of Expertise */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
                
                <div>
                  <Label>Subjects you are planning to teach *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {COMMON_SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                        />
                        <Label htmlFor={subject} className="text-sm">{subject}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      placeholder="Add custom subjects (comma separated)"
                      value={formData.subjects.filter(s => !COMMON_SUBJECTS.includes(s)).join(', ')}
                      onChange={(e) => {
                        const customSubjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        const allSubjects = [...formData.subjects.filter(s => COMMON_SUBJECTS.includes(s)), ...customSubjects];
                        updateFormData('subjects', allSubjects);
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="teachingExperience">Teaching/Training Experience *</Label>
                  <Select value={formData.teachingExperience} onValueChange={(value) => updateFormData('teachingExperience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Preferred Level of Students *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {STUDENT_LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={formData.preferredLevels.includes(level)}
                          onCheckedChange={(checked) => handleLevelChange(level, checked as boolean)}
                        />
                        <Label htmlFor={level} className="text-sm">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Social & Professional Links */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social & Professional Links</h3>
                
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile *</Label>
                  <Input
                    id="linkedinProfile"
                    type="url"
                    value={formData.linkedinProfile}
                    onChange={(e) => updateFormData('linkedinProfile', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="githubPortfolio">GitHub or Portfolio (Optional)</Label>
                  <Input
                    id="githubPortfolio"
                    type="url"
                    value={formData.githubPortfolio}
                    onChange={(e) => updateFormData('githubPortfolio', e.target.value)}
                    placeholder="https://github.com/your-username or your portfolio URL"
                  />
                </div>
                
                <div>
                  <Label htmlFor="profilePicture">Upload Profile Picture</Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a professional photo (optional)</p>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Previous
                </Button>
              )}
              
              <div className="flex-1"></div>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitted || !isStepValid()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {isLoading ? 'Saving...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 