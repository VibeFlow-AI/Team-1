"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "@heroicons/react/24/outline";

interface Mentor {
  id: number;
  name: string;
  location: string;
  tags: string[];
  description: string;
  duration: string;
  languages: string[];
  availability: string[];
  price: string;
  image: string;
  role: string;
}

const mentors: Mentor[] = [
  {
    id: 1,
    name: "Rahul Lavan",
    location: "Colombo",
    tags: ["Science", "Physics", "Biology"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    duration: "30 mins – 1 hour",
    languages: ["English", "Tamil"],
    availability: ["Monday", "Wednesday", "Friday"],
    price: "$50/hr",
    image: "/api/placeholder/64/64",
    role: "Science Tutor",
  },
  {
    id: 2,
    name: "Chathum Rahal",
    location: "Galle",
    tags: ["Mathematics", "History", "English"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    duration: "1 hour",
    languages: ["English"],
    availability: ["Tuesday", "Thursday", "Saturday"],
    price: "$45/hr",
    image: "/api/placeholder/64/64",
    role: "Math & History Tutor",
  },
  {
    id: 3,
    name: "Malsha Fernando",
    location: "Colombo",
    tags: ["Chemistry", "Art", "Commerce"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    duration: "1 hour",
    languages: ["Sinhala"],
    availability: ["Monday", "Tuesday", "Sunday"],
    price: "$40/hr",
    image: "/api/placeholder/64/64",
    role: "Chemistry & Art Tutor",
  },
];

export default function SessionsSection() {
  const [bookmarked, setBookmarked] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  return (
    <section id="sessions" className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-normal text-black mb-4">
            Session Highlights – Trending Now
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Join the sessions students are raving about. These expert-led,
            high-impact sessions are designed to help you unlock your full
            potential, whether you're polishing your resume, mapping out your
            career path, or getting ready to ace technical interviews.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((m) => (
            <Card key={m.id} className="relative bg-white rounded-t-xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-900">
                    {initials(m.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-500">{m.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm">{m.description}</p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Available:</p>
                  <div className="flex flex-wrap gap-1">
                    {m.availability.map((day) => (
                      <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Arch for card footer */}
              <div className="w-full h-6 bg-white rounded-b-full -mt-6"></div>
              {/* Footer - Book Button & Bookmark */}
              <div className="flex items-center justify-between px-4 -mt-4">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded" onClick={() => handleBookSession(m)}>
                  Book a session
                </Button>
                <button
                  onClick={() =>
                    setBookmarked(bookmarked === m.id ? null : m.id)
                  }
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <BookmarkIcon
                    className={`w-6 h-6 ${
                      bookmarked === m.id ? "text-indigo-600" : ""
                    }`}
                  />
                </button>
              </div>
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
                    <Button className="bg-black hover:bg-gray-800 text-white">
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
