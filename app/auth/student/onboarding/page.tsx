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
import { X, Plus } from 'lucide-react';

interface FormData {
  // Basic Information
  fullName: string;
  age: number;
  contactNumber: string;
  
  // Academic Background
  currentEducationLevel: 'GRADE_9' | 'ORDINARY_LEVEL' | 'ADVANCED_LEVEL';
  school: string;
  
  // Subject & Skill Assessment
  subjectsOfInterest: string[];
  currentYear: number;
  skillLevels: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>;
  preferredLearningStyle: 'VISUAL' | 'HANDS_ON' | 'THEORETICAL' | 'MIXED';
  hasLearningDisabilities: 'YES' | 'NO';
  learningDisabilities: string;
}

export default function StudentOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [data, setData] = useState<FormData>({
    fullName: '',
    age: 0,
    contactNumber: '',
    currentEducationLevel: 'GRADE_9',
    school: '',
    subjectsOfInterest: [],
    currentYear: 1,
    skillLevels: {},
    preferredLearningStyle: 'MIXED',
    hasLearningDisabilities: 'NO',
    learningDisabilities: '',
  });

  const { user } = useAuth();
  const router = useRouter();

  // Check if user already has a profile
  useEffect(() => {
    if (user && user.hasProfile) {
      router.push('/dashboard/student');
    }
  }, [user, router]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('studentOnboardingData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Handle legacy data format where subjectsOfInterest was a string
        if (typeof parsed.subjectsOfInterest === 'string') {
          parsed.subjectsOfInterest = parsed.subjectsOfInterest
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
        setData(parsed);
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data.fullName) { // Only save if we have some data
      localStorage.setItem('studentOnboardingData', JSON.stringify(data));
    }
  }, [data]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitted || isLoading) {
      return; // Prevent multiple submissions
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Convert subjectsOfInterest array to string for API compatibility
      const submitData = {
        ...data,
        subjectsOfInterest: data.subjectsOfInterest.join(', ')
      };

      console.log('Submitting data:', submitData);

      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        setIsSubmitted(true);
        // Clear saved data
        localStorage.removeItem('studentOnboardingData');
        // Force a page reload to update auth state
        window.location.href = '/dashboard/student';
      } else {
        const result = await response.json();
        console.error('Error response:', result);
        setError(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !data.subjectsOfInterest.includes(newSubject.trim())) {
      setData(prev => ({
        ...prev,
        subjectsOfInterest: [...prev.subjectsOfInterest, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setData(prev => ({
      ...prev,
      subjectsOfInterest: prev.subjectsOfInterest.filter(subject => subject !== subjectToRemove),
      skillLevels: Object.fromEntries(
        Object.entries(prev.skillLevels).filter(([subject]) => subject !== subjectToRemove)
      )
    }));
  };

  const updateSkillLevel = (subject: string, level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
    setData(prev => ({
      ...prev,
      skillLevels: {
        ...prev.skillLevels,
        [subject]: level
      }
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubject();
    }
  };

  const isFormValid = () => {
    // Check basic information
    if (!data.fullName || !data.age || !data.contactNumber) {
      return false;
    }
    
    // Check academic background
    if (!data.school) {
      return false;
    }
    
    // Check subject & skill assessment
    if (data.subjectsOfInterest.length === 0) {
      return false;
    }
    
    // Check if learning disabilities description is required
    if (data.hasLearningDisabilities === 'YES' && !data.learningDisabilities.trim()) {
      return false;
    }
    
    return true;
  };

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">This page is only for students.</p>
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
          <CardTitle className="text-2xl font-bold text-gray-900">Student Onboarding</CardTitle>
          <p className="text-gray-600">Complete your profile to get started</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
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
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="block mb-2">Full Name</Label>
                    <Input
                      id="fullName"
                      value={data.fullName}
                      onChange={(e) => setData({ ...data, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age" className="block mb-2">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={data.age || ''}
                      onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 0 })}
                      placeholder="Enter your age"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contactNumber" className="block mb-2">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={data.contactNumber}
                    onChange={(e) => setData({ ...data, contactNumber: e.target.value })}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Academic Background */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Background</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentEducationLevel" className="block mb-2">Current Education Level</Label>
                    <Select
                      value={data.currentEducationLevel}
                      onValueChange={(value: 'GRADE_9' | 'ORDINARY_LEVEL' | 'ADVANCED_LEVEL') => 
                        setData({ ...data, currentEducationLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="GRADE_6">Grade 6</SelectItem>
                      <SelectItem value="GRADE_">Grade 7</SelectItem>
                      <SelectItem value="GRADE_8">Grade 8</SelectItem>
                      <SelectItem value="GRADE_9">Grade 9</SelectItem>
                        <SelectItem value="ORDINARY_LEVEL">Ordinary Level</SelectItem>
                        <SelectItem value="ADVANCED_LEVEL">Advanced Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="school" className="block mb-2">School Name</Label>
                  <Input
                    id="school"
                    value={data.school}
                    onChange={(e) => setData({ ...data, school: e.target.value })}
                    placeholder="Enter your school name"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Step 3: Subject & Skill Assessment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject & Skill Assessment</h3>
                
                <div>
                  <Label htmlFor="subjectsOfInterest" className="block mb-2">Subjects of Interest</Label>
                  <p className="text-sm text-gray-600 mb-3">Add the subjects you're interested in learning:</p>
                  
                  {/* Subject Input */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      id="newSubject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter a subject (e.g., Mathematics)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSubject}
                      disabled={!newSubject.trim()}
                      className="px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Display Added Subjects */}
                  {data.subjectsOfInterest.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.subjectsOfInterest.map((subject) => (
                        <div
                          key={subject}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{subject}</span>
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                    <Label htmlFor="currentYear" className="block mb-2">Current Year</Label>
                    <Input
                      id="currentYear"
                      type="number"
                      value={data.currentYear || ''}
                      onChange={(e) => setData({ ...data, currentYear: parseInt(e.target.value) || 1 })}
                      placeholder="Enter current year"
                      min="1"
                      max="6"
                      required
                    />
                  </div>

                {/* Skill Levels - Only show for entered subjects */}
                {data.subjectsOfInterest.length > 0 && (
                  <div>
                    <Label className="block mb-2">Skill Levels</Label>
                    <p className="text-sm text-gray-600 mb-3">Rate your skill level in each subject:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.subjectsOfInterest.map((subject) => (
                        <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{subject}</span>
                          <Select
                            value={data.skillLevels[subject] || 'BEGINNER'}
                            onValueChange={(value: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => 
                              updateSkillLevel(subject, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Beginner</SelectItem>
                              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                              <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredLearningStyle" className="block mb-2">Preferred Learning Style</Label>
                    <Select
                      value={data.preferredLearningStyle}
                      onValueChange={(value: 'VISUAL' | 'HANDS_ON' | 'THEORETICAL' | 'MIXED') => 
                        setData({ ...data, preferredLearningStyle: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VISUAL">Visual</SelectItem>
                        <SelectItem value="HANDS_ON">Hands-on</SelectItem>
                        <SelectItem value="THEORETICAL">Theoretical</SelectItem>
                        <SelectItem value="MIXED">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="hasLearningDisabilities" className="block mb-2">Do you have any learning disabilities?</Label>
                    <Select
                      value={data.hasLearningDisabilities}
                      onValueChange={(value: 'YES' | 'NO') => 
                        setData({ ...data, hasLearningDisabilities: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">Yes</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {data.hasLearningDisabilities === 'YES' && (
                  <div>
                    <Label htmlFor="learningDisabilities" className="block mb-2">Describe your learning disabilities or special needs</Label>
                    <Textarea
                      id="learningDisabilities"
                      value={data.learningDisabilities}
                      onChange={(e) => setData({ ...data, learningDisabilities: e.target.value })}
                      placeholder="e.g., Dyslexia, ADHD, Autism, etc."
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!data.fullName || !data.age || !data.contactNumber)) ||
                    (currentStep === 2 && (!data.school))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
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