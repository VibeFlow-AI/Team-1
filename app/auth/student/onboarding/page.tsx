"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface OnboardingData {
  // Part 1: Basic Information
  fullName: string;
  age: number;
  contactNumber: string;
  
  // Part 2: Academic Background
  currentEducationLevel: 'GRADE_9' | 'ORDINARY_LEVEL' | 'ADVANCED_LEVEL';
  school: string;
  
  // Part 3: Subject & Skill Assessment
  subjectsOfInterest: string;
  currentYear: number;
  skillLevels: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>;
  preferredLearningStyle: 'VISUAL' | 'HANDS_ON' | 'THEORETICAL' | 'MIXED';
  learningDisabilities: string;
}

export default function StudentOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    age: 0,
    contactNumber: '',
    currentEducationLevel: 'GRADE_9',
    school: '',
    subjectsOfInterest: '',
    currentYear: 1,
    skillLevels: {},
    preferredLearningStyle: 'MIXED',
    learningDisabilities: '',
  });

  const { user } = useAuth();
  const router = useRouter();

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch('/api/student/onboarding');
        if (response.ok) {
          const result = await response.json();
          if (result.profile) {
            setData({
              fullName: result.profile.fullName || '',
              age: result.profile.age || 0,
              contactNumber: result.profile.contactNumber || '',
              currentEducationLevel: result.profile.currentEducationLevel || 'GRADE_9',
              school: result.profile.school || '',
              subjectsOfInterest: result.profile.subjectsOfInterest || '',
              currentYear: result.profile.currentYear || 1,
              skillLevels: result.profile.skillLevels || {},
              preferredLearningStyle: result.profile.preferredLearningStyle || 'MIXED',
              learningDisabilities: result.profile.learningDisabilities || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load existing data:', error);
      }
    };

    loadExistingData();
  }, []);

  // Save data to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('studentOnboardingData', JSON.stringify(data));
  }, [data]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('studentOnboardingData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
  }, []);

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        localStorage.removeItem('studentOnboardingData'); // Clear saved data
        router.push('/dashboard');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to save profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Who Are You?</h3>
      <p className="text-gray-600">Tell us about yourself</p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateData('fullName', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={data.age || ''}
            onChange={(e) => updateData('age', parseInt(e.target.value) || 0)}
            placeholder="Enter your age"
            min="1"
            max="100"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={data.contactNumber}
            onChange={(e) => updateData('contactNumber', e.target.value)}
            placeholder="Enter your contact number"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Academic Background</h3>
      <p className="text-gray-600">Tell us about your education</p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="educationLevel">Current Education Level</Label>
          <select
            id="educationLevel"
            value={data.currentEducationLevel}
            onChange={(e) => updateData('currentEducationLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="GRADE_9">Grade 9</option>
            <option value="ORDINARY_LEVEL">Ordinary Level</option>
            <option value="ADVANCED_LEVEL">Advanced Level</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="school">School</Label>
          <Input
            id="school"
            value={data.school}
            onChange={(e) => updateData('school', e.target.value)}
            placeholder="Enter your school name"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const subjects = data.subjectsOfInterest.split(',').map(s => s.trim()).filter(s => s);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Subject & Skill Assessment</h3>
        <p className="text-gray-600">Help us understand your learning needs</p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subjects">Subjects of Interest</Label>
            <Input
              id="subjects"
              value={data.subjectsOfInterest}
              onChange={(e) => updateData('subjectsOfInterest', e.target.value)}
              placeholder="e.g., Mathematics, Science, English (comma separated)"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="currentYear">Current Year</Label>
            <Input
              id="currentYear"
              type="number"
              value={data.currentYear || ''}
              onChange={(e) => updateData('currentYear', parseInt(e.target.value) || 1)}
              placeholder="Enter your current year"
              min="1"
              required
            />
          </div>
          
          {subjects.length > 0 && (
            <div>
              <Label>Current Skill Level (Per Subject)</Label>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject} className="flex items-center justify-between p-3 border rounded-md">
                    <span className="font-medium">{subject}</span>
                    <div className="flex space-x-2">
                      {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
                        <label key={level} className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name={subject}
                            value={level}
                            checked={data.skillLevels[subject] === level}
                            onChange={() => updateData('skillLevels', {
                              ...data.skillLevels,
                              [subject]: level
                            })}
                            className="text-blue-600"
                          />
                          <span className="text-sm">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="learningStyle">Preferred Learning Style</Label>
            <select
              id="learningStyle"
              value={data.preferredLearningStyle}
              onChange={(e) => updateData('preferredLearningStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="VISUAL">Visual</option>
              <option value="HANDS_ON">Hands-On</option>
              <option value="THEORETICAL">Theoretical</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="disabilities">Learning Disabilities or Accommodations</Label>
            <Textarea
              id="disabilities"
              value={data.learningDisabilities}
              onChange={(e) => updateData('learningDisabilities', e.target.value)}
              placeholder="Describe any learning disabilities or accommodations needed (optional)"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 