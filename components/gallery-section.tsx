"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  description?: string;
}

const initialImages: GalleryItem[] = [
  {
    src: "/gallery/personalized-learning.png",
    alt: "Personalized Learning",
    title: "Tailored Learning for You",
    description:
      "Each session is customized to your unique goals and pace—making learning more personal, focused, and effective."
  },
  {
    src: "/gallery/real-mentors.png",
    alt: "Real Mentors, Real Guidance",
    title: "Real Mentors. Real Impact.",
    description:
      "Our mentors are experienced, approachable, and here to support your academic and career growth every step of the way."
  },
  {
    src: "/gallery/growth-career.png",
    alt: "Growth & Career Readiness",
    title: "Built for Career Growth",
    description:
      "Explore sessions designed to sharpen your resume, prep for interviews, and map out your next big career move."
  },
  {
    src: "/gallery/insights-support.png",
    alt: "Insights-Driven Support",
    title: "Support Backed by Insight",
    description:
      "Access mentorship powered by experience, data, and student feedback—so you get smarter, more targeted help."
  }
];

export default function GallerySection() {
  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setImages((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setIsFading(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="gallery" className="py-20 bg-gradient-to-r from-blue-50 to-green-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-normal text-black mb-4">
            What's in it for Students?
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Discover how EduVibe mentors help you navigate challenges, explore opportunities, and build real-world readiness—all tailored just for you.
          </p>
        </div>
        {/* Grid Cards */}
        <div className="grid grid-cols-5 gap-6">
          {images.map((item, idx) => {
            const span = idx === 0 ? "col-span-2" : "col-span-1";
            return (
              <div
                key={idx}
                className={`relative ${span} h-80 bg-white rounded-2xl overflow-hidden transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white text-lg font-semibold leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white mt-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
