"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Career Development Coach",
    expertise: "Career transitions, Leadership, Personal branding",
    experience: "15+ years",
    rating: 4.9,
    sessions: 1200,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    price: "$150",
    availability: ["Mon", "Wed", "Fri"],
    description: "Helping professionals navigate career transitions and develop leadership skills."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Tech Mentor",
    expertise: "Software Development, AI/ML, Product Management",
    experience: "12+ years",
    rating: 4.8,
    sessions: 950,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    price: "$180",
    availability: ["Tue", "Thu", "Sat"],
    description: "Expert in modern software development practices and emerging technologies."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Business Strategy Advisor",
    expertise: "Startup growth, Business planning, Market analysis",
    experience: "18+ years",
    rating: 4.9,
    sessions: 800,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    price: "$200",
    availability: ["Mon", "Tue", "Wed"],
    description: "Guiding entrepreneurs and businesses through strategic planning and growth."
  },
  {
    id: 4,
    name: "David Kim",
    role: "Life Coach",
    expertise: "Personal development, Goal setting, Work-life balance",
    experience: "10+ years",
    rating: 4.7,
    sessions: 650,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    price: "$120",
    availability: ["Thu", "Fri", "Sun"],
    description: "Supporting individuals in achieving personal and professional goals."
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Marketing Specialist",
    expertise: "Digital marketing, Brand strategy, Social media",
    experience: "14+ years",
    rating: 4.8,
    sessions: 1100,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
    price: "$160",
    availability: ["Mon", "Wed", "Sat"],
    description: "Helping businesses build strong brands and effective marketing strategies."
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Financial Advisor",
    expertise: "Investment planning, Financial literacy, Retirement planning",
    experience: "20+ years",
    rating: 4.9,
    sessions: 1400,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    price: "$220",
    availability: ["Tue", "Thu", "Fri"],
    description: "Providing comprehensive financial guidance for long-term wealth building."
  }
];

export default function SessionsSection() {
  const [selectedMentor, setSelectedMentor] = useState<typeof mentors[0] | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookSession = (mentor: typeof mentors[0]) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  return (
    <section id="sessions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Book Your Session
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our expert mentors and book a session that fits your schedule. 
            Each mentor brings unique expertise and experience to help you achieve your goals.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">{mentor.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{mentor.role}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{mentor.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Experience: {mentor.experience}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{mentor.rating}</span>
                    <span className="text-gray-500">({mentor.sessions} sessions)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Expertise:</p>
                  <p className="text-sm text-gray-600">{mentor.expertise}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Available:</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.availability.map((day) => (
                      <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-2xl font-bold text-gray-900">{mentor.price}</div>
                  <Button 
                    onClick={() => handleBookSession(mentor)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedMentor.image}
                  alt={selectedMentor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedMentor.name}</h3>
                  <p className="text-blue-600">{selectedMentor.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>30 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-lg font-semibold text-gray-900">Total: {selectedMentor.price}</span>
                  <div className="space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 