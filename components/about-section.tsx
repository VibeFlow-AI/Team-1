"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About MentorHub
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              MentorHub connects passionate learners with seasoned professionals
              across industries. Our platform provides personalized guidance,
              fosters meaningful connections, and drives professional growth.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3">
                  🌟
                </span>
                <span className="text-gray-700">
                  Curated network of 500+ expert mentors
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full mr-3">
                  📈
                </span>
                <span className="text-gray-700">
                  Over 10,000 successful sessions completed
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full mr-3">
                  🎯
                </span>
                <span className="text-gray-700">
                  Focus on career development, leadership, and growth
                </span>
              </li>
            </ul>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Image Illustration */}
          <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1581090700227-fb4e80f8a19b?auto=format&fit=crop&w=800&q=80"
              alt="Mentorship"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
